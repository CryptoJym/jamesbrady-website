// Which rails exist, decided from the environment and nothing else.
//
// chatbot-spec § Ops: "deploy fails loudly if missing (no dummy-key fallback in
// production paths — the old route's 'dummy-key-for-build' pattern is banned)".
// A key-shaped placeholder is worse than no key: the route looks alive, spends
// nothing, and fails at the provider with an error the visitor cannot read.
//
// So the rails are all-or-nothing. Missing anything means the route answers 503
// with the names of what is missing, the dock keeps the behaviour it shipped in
// wave 1, and nobody has to guess which half is switched on.

import { createHash } from "node:crypto";

import { SITE_HOST } from "@/lib/seo/site";
import { MODEL, restStore, type LimitStore } from "./limits";

export type AskRails =
  | { configured: true; apiKey: string; model: string; store: LimitStore }
  /** `missing` carries variable NAMES. A value never appears in a response or a log. */
  | { configured: false; missing: string[] };

const trim = (value: string | undefined) => (typeof value === "string" ? value.trim() : "");

/**
 * The two store conventions, in order. Upstash Redis and Vercel KV expose the
 * same REST protocol under different variable names, so either pair is enough
 * and neither is required over the other.
 */
const STORE_CONVENTIONS = [
  { kind: "upstash", url: "UPSTASH_REDIS_REST_URL", token: "UPSTASH_REDIS_REST_TOKEN" },
  { kind: "vercel-kv", url: "KV_REST_API_URL", token: "KV_REST_API_TOKEN" },
] as const;

export function askRails(env: Record<string, string | undefined> = process.env): AskRails {
  const missing: string[] = [];

  const apiKey = trim(env.XAI_API_KEY);
  if (!apiKey) missing.push("XAI_API_KEY");

  const convention = STORE_CONVENTIONS.find((c) => trim(env[c.url]) && trim(env[c.token]));
  if (!convention) {
    missing.push(
      `${STORE_CONVENTIONS[0].url} + ${STORE_CONVENTIONS[0].token} (or ${STORE_CONVENTIONS[1].url} + ${STORE_CONVENTIONS[1].token})`,
    );
  }

  if (missing.length > 0 || !convention) return { configured: false, missing };

  return {
    configured: true,
    apiKey,
    model: trim(env.XAI_MODEL) || MODEL,
    store: restStore(trim(env[convention.url]), trim(env[convention.token]), convention.kind),
  };
}

/** ------------------------------------------------------------- origin */

/**
 * Origin check: the canonical host, or the host this request was actually
 * served from.
 *
 * The second half is the ordinary same-origin test, and it is what makes this
 * correct without a single environment switch. A page on someone else's site
 * that posts here carries THEIR origin and OUR host, so the two disagree and
 * the request is refused. The site's own page carries the same value in both.
 * A local build, a Vercel preview and production all pass for the same reason,
 * so there is no "allow localhost when not production" branch to get wrong, and
 * no env knob that could quietly widen the check on the deployment that matters.
 *
 * `selfHost` comes from x-forwarded-host, then host. Both are set by the
 * platform for a real browser request; neither is a value the attacking page
 * controls.
 */
export function isAllowedOrigin(origin: string | null, selfHost: string | null): boolean {
  if (!origin) return false;
  if (origin === SITE_HOST) return true;
  if (!selfHost) return false;
  try {
    return new URL(origin).host === selfHost;
  } catch {
    return false;
  }
}

/** The host this request was served from, as the platform reports it. */
export function requestHost(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-host");
  return (forwarded ?? request.headers.get("host") ?? "").split(",")[0].trim() || null;
}

/** ------------------------------------------------------------ identity */

/**
 * The client address, hashed with a per-deployment salt before it is ever used
 * as a key. Counting requests needs a stable token, not an address, and a
 * plain address sitting in a shared cache is personal data this site has no
 * reason to hold.
 */
export function hashIp(
  ip: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const salt = trim(env.ASK_IP_SALT) || trim(env.XAI_API_KEY) || "jamesbrady.org";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

/** Session ids are client-generated. Accept only an opaque token of our own shape. */
export function normalizeSessionId(value: unknown): string | null {
  return typeof value === "string" && /^[a-z0-9]{16,64}$/.test(value) ? value : null;
}
