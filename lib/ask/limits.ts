// Rate limits, spend accounting and the circuit breaker.
//
// chatbot-spec § Ops. Every number here is a rail the route cannot serve
// without.
//
// NO IN-MEMORY FALLBACK. A module-level counter is per lambda instance, so on
// Vercel it is per visitor in the worst case and shared between visitors in the
// best one. That exact defect is what the /lab manifold chat is being rebuilt
// to remove; reintroducing it here as a "graceful degradation" would make the
// limit a decoration. Absent store means the route is not configured and says
// so, which is a state a person can act on.

/** ------------------------------------------------------------- pricing */

/**
 * BUILD-VERIFIED 2026-08-11 against https://docs.x.ai/developers/pricing and
 * https://docs.x.ai/developers/models/grok-4.5. USD per million tokens.
 *
 * xAI prices in two tiers by PROMPT size, not by total: a request whose prompt
 * is at or over 200,000 tokens is billed at the high tier for that request.
 * The pack is far below that today; the tier is implemented anyway so the
 * ceiling stays honest if the site's content ever grows past it.
 */
export const MODEL = "grok-4.5";

export const PRICING = {
  model: MODEL,
  verifiedOn: "2026-08-11",
  source: "https://docs.x.ai/developers/pricing",
  tierBoundaryPromptTokens: 200_000,
  low: { input: 2.0, cachedInput: 0.3, output: 6.0 },
  high: { input: 4.0, cachedInput: 0.6, output: 12.0 },
} as const;

/**
 * The billed usage fields, as xAI returns them on the OpenAI-compatible chat
 * completions endpoint (BUILD-VERIFIED 2026-08-11:
 * https://docs.x.ai/developers/advanced-api-usage/prompt-caching/usage-and-pricing
 * — cached tokens arrive at `usage.prompt_tokens_details.cached_tokens`).
 */
export type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number } | null;
};

export type CostBreakdown = {
  promptTokens: number;
  cachedTokens: number;
  uncachedPromptTokens: number;
  completionTokens: number;
  tier: "low" | "high";
  usd: number;
};

/**
 * Cost of one call. Both usage fields are counted, cached and uncached held
 * apart, because they are billed at different rates and a ceiling that assumed
 * one rate would drift from the invoice in whichever direction flattered it.
 */
export function costOf(usage: Usage | null | undefined): CostBreakdown {
  const promptTokens = Math.max(0, Math.trunc(usage?.prompt_tokens ?? 0));
  const completionTokens = Math.max(0, Math.trunc(usage?.completion_tokens ?? 0));
  const cachedTokens = Math.min(
    promptTokens,
    Math.max(0, Math.trunc(usage?.prompt_tokens_details?.cached_tokens ?? 0)),
  );
  const uncachedPromptTokens = promptTokens - cachedTokens;
  const tier = promptTokens >= PRICING.tierBoundaryPromptTokens ? "high" : "low";
  const rate = PRICING[tier];
  const usd =
    (uncachedPromptTokens * rate.input +
      cachedTokens * rate.cachedInput +
      completionTokens * rate.output) /
    1_000_000;
  return { promptTokens, cachedTokens, uncachedPromptTokens, completionTokens, tier, usd };
}

/** --------------------------------------------------------------- rails */

export const RAILS = {
  /** Messages per browser session, rolling over a day. */
  sessionMessages: 10,
  sessionWindowSeconds: 24 * 60 * 60,
  /** Messages per IP per hour. */
  ipMessagesPerHour: 30,
  ipWindowSeconds: 60 * 60,
  /** Owner default. Crossing it opens the breaker for the rest of the UTC day. */
  dailyCeilingUsd: 10,
  spendWindowSeconds: 48 * 60 * 60,
  /** chatbot-spec § Model parameters. */
  maxTokens: 1500,
} as const;

/** ---------------------------------------------------------- the store */

/**
 * The pluggable bit. Upstash Redis and Vercel KV both speak the same REST
 * protocol, so one adapter covers both; anything else that can count and expire
 * satisfies this interface.
 */
export type LimitStore = {
  /** Human-readable name, for the health payload. Never a credential. */
  readonly kind: string;
  /** Increment an integer counter and return the new value. Sets the TTL on creation. */
  incr(key: string, ttlSeconds: number): Promise<number>;
  /** Add to a float accumulator and return the new value. Sets the TTL on creation. */
  incrByFloat(key: string, amount: number, ttlSeconds: number): Promise<number>;
  /** Read a float accumulator. Absent key reads 0. */
  getNumber(key: string): Promise<number>;
};

export class StoreUnavailableError extends Error {}

/**
 * Upstash / Vercel KV REST adapter.
 *
 * EXPIRE carries the NX flag so a running window is never extended by the next
 * request inside it. Without NX, a visitor sending one message every 59 minutes
 * would hold an hour window open forever and the cap would never reset.
 */
export function restStore(url: string, token: string, kind: string): LimitStore {
  const base = url.replace(/\/+$/, "");

  async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    let response: Response;
    try {
      response = await fetch(`${base}/pipeline`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(commands),
        cache: "no-store",
      });
    } catch (cause) {
      throw new StoreUnavailableError(`limit store unreachable (${kind})`, { cause });
    }
    if (!response.ok) throw new StoreUnavailableError(`limit store returned ${response.status}`);
    const body = (await response.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(body)) throw new StoreUnavailableError("limit store returned an unexpected body");
    return body.map((entry) => {
      if (entry?.error) throw new StoreUnavailableError("limit store reported a command error");
      return entry?.result;
    });
  }

  const num = (value: unknown): number => {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) throw new StoreUnavailableError("limit store returned a non-number");
    return n;
  };

  return {
    kind,
    async incr(key, ttlSeconds) {
      const [value] = await pipeline([
        ["INCR", key],
        ["EXPIRE", key, ttlSeconds, "NX"],
      ]);
      return num(value);
    },
    async incrByFloat(key, amount, ttlSeconds) {
      const [value] = await pipeline([
        ["INCRBYFLOAT", key, amount],
        ["EXPIRE", key, ttlSeconds, "NX"],
      ]);
      return num(value);
    },
    async getNumber(key) {
      const [value] = await pipeline([["GET", key]]);
      return value === null || value === undefined ? 0 : num(value);
    },
  };
}

/** ----------------------------------------------------------- the math */

export const KEYS = {
  session: (sessionId: string) => `ask:v1:session:${sessionId}`,
  ip: (ipHash: string, hourBucket: number) => `ask:v1:ip:${ipHash}:${hourBucket}`,
  spend: (day: string) => `ask:v1:spend:${day}`,
} as const;

/** UTC hour index. The IP window is a fixed hour bucket, stated as such. */
export function hourBucket(now: Date): number {
  return Math.floor(now.getTime() / 3_600_000);
}

/** UTC day, the unit the ceiling is stated in. */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export type Gate =
  | { allow: true; sessionUsed: number; ipUsed: number; spentUsd: number }
  | { allow: false; reason: "session" | "ip" | "ceiling"; spentUsd: number };

/**
 * Check every rail, in order, before a token is spent.
 *
 * The breaker is read FIRST and read before the counters are incremented: once
 * the day's spend is over the ceiling nothing else matters, and a request that
 * is going to be refused should not consume a visitor's session allowance.
 */
export async function checkGate(
  store: LimitStore,
  input: { sessionId: string; ipHash: string; now?: Date },
): Promise<Gate> {
  const now = input.now ?? new Date();
  const spentUsd = await store.getNumber(KEYS.spend(utcDay(now)));
  if (spentUsd >= RAILS.dailyCeilingUsd) return { allow: false, reason: "ceiling", spentUsd };

  const sessionUsed = await store.incr(KEYS.session(input.sessionId), RAILS.sessionWindowSeconds);
  if (sessionUsed > RAILS.sessionMessages) return { allow: false, reason: "session", spentUsd };

  const ipUsed = await store.incr(KEYS.ip(input.ipHash, hourBucket(now)), RAILS.ipWindowSeconds);
  if (ipUsed > RAILS.ipMessagesPerHour) return { allow: false, reason: "ip", spentUsd };

  return { allow: true, sessionUsed, ipUsed, spentUsd };
}

/** Record what a call cost. Returns the day's running total. */
export function recordSpend(store: LimitStore, usd: number, now = new Date()): Promise<number> {
  return store.incrByFloat(KEYS.spend(utcDay(now)), usd, RAILS.spendWindowSeconds);
}
