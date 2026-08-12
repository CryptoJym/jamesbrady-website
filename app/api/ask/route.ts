// The Ask dock backend — chatbot-spec.
//
// FAIL-CLOSED. The route serves an answer only when every rail is present: an
// xAI key AND a shared counting store. Missing either one and it answers 503
// with `{"state":"not_configured"}` and the names of what is missing, and the
// dock keeps the terms-and-mailto behaviour it shipped with. There is no
// in-memory limiter fallback, because a module-level counter on a serverless
// platform is per instance: it would let one visitor through ten times per
// cold start and share another visitor's count with a stranger. That is the
// defect being removed from the /lab demo, not a pattern to copy.
//
// Nothing about a conversation is stored. The store holds three integers and
// one running total; no message text is written to it, returned in a log line,
// or kept anywhere on this server.

import OpenAI from "openai";

import { discoverableTheories, work } from "@/lib/content";
import {
  askRails,
  hashIp,
  isAllowedOrigin,
  normalizeSessionId,
  requestHost,
} from "@/lib/ask/config";
import { GROUNDING_PACK, GROUNDING_PACK_SHA256 } from "@/lib/ask/grounding-pack.generated";
import {
  RAILS,
  StoreUnavailableError,
  checkGate,
  costOf,
  recordSpend,
  type Usage,
} from "@/lib/ask/limits";
import { buildMessages, normalizeHistory } from "@/lib/ask/prompt";
import {
  REPLY_JSON_SCHEMA,
  REPLY_SCHEMA_VERSION,
  checkKnownRefs,
  validateReply,
  type Reply,
  type ReplyBlock,
} from "@/lib/ask/schema";
import { SITE, SITE_HOST } from "@/lib/seo/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The provider. Overridable for local QA only, the same way LEAD_INGEST_URL
 * already is: pointing it at a stub is how the block renderer gets exercised
 * without spending money or shipping a fake reply path into the product. The
 * default is the real endpoint and verify-ask asserts it.
 */
const XAI_BASE_URL = process.env.XAI_BASE_URL?.trim() || "https://api.x.ai/v1";
const REQUEST_TIMEOUT_MS = 25_000;

const KNOWN = {
  work: new Set(work.map((entry) => entry.slug)),
  theories: new Set(discoverableTheories.map((entry) => entry.slug)),
};

/** Copy that ships without a model in the loop. Every string is register-checked. */
const STATIC = {
  resting: `That is the assistant's budget for today. Email ${SITE.email} and James will answer himself.`,
  rateLimitedSession: `That is the limit for one visit. The pages themselves hold the long version, and ${SITE.email} reaches James directly.`,
  rateLimitedIp: `Too many questions from this network in the last hour. Try again shortly, or email ${SITE.email}.`,
  providerError: `The assistant could not answer that one. Nothing is wrong with your question. Email ${SITE.email} and James will pick it up.`,
  tooLong: "That answer ran longer than the room it has. Ask for one part of it and it will fit.",
  refused: "That one falls outside what this assistant will answer. Ask about the work on this site and it will help.",
  emptyQuestion: "Type a question and the assistant will answer from what is published here.",
} as const;

const decline = (message: string): Reply => ({ blocks: [{ type: "decline", message }] });

/**
 * A JSON response with an explicit content-length.
 *
 * Length matters: without it the platform serves the body chunked, and a client
 * that does not drain the stream leaves the connection open. That is a real
 * failure mode, not a tidiness point — an undrained 503 here hung every
 * headless check waiting for network idle.
 */
function json(body: unknown, status: number) {
  const text = JSON.stringify(body);
  return new Response(text, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-length": String(new TextEncoder().encode(text).byteLength),
      "cache-control": "no-store",
    },
  });
}

/**
 * State the dock reads at mount. No key, no store URL, no spend: a name of a
 * missing variable is the most this may say about the environment.
 */
export function GET() {
  const rails = askRails();
  if (!rails.configured) {
    return json({ state: "not_configured", missing: rails.missing }, 503);
  }
  return json(
    {
      state: "ready",
      model: rails.model,
      schema: REPLY_SCHEMA_VERSION,
      pack: GROUNDING_PACK_SHA256.slice(0, 12),
      sessionMessages: RAILS.sessionMessages,
    },
    200,
  );
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  // Origin first: the cheapest refusal, and the one that keeps this endpoint
  // from being a free proxy embedded in someone else's page.
  if (!isAllowedOrigin(request.headers.get("origin"), requestHost(request))) {
    return json({ state: "forbidden_origin" }, 403);
  }

  const rails = askRails();
  if (!rails.configured) {
    return json({ state: "not_configured", missing: rails.missing }, 503);
  }

  let payload: { sessionId?: unknown; messages?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ state: "bad_request" }, 400);
  }

  const sessionId = normalizeSessionId(payload.sessionId);
  if (!sessionId) return json({ state: "bad_request" }, 400);

  const history = normalizeHistory(payload.messages);
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return json({ state: "ok", ...decline(STATIC.emptyQuestion) }, 200);
  }

  // ---- rails --------------------------------------------------------------
  let gate;
  try {
    gate = await checkGate(rails.store, { sessionId, ipHash: hashIp(clientIp(request)) });
  } catch (error) {
    // A store that is configured but not answering is a different honest state
    // from a store that was never set up. Both refuse; neither guesses.
    console.error("[ask] limit store unavailable:", error instanceof StoreUnavailableError);
    return json({ state: "unavailable" }, 503);
  }

  if (!gate.allow) {
    if (gate.reason === "ceiling") {
      console.log(`[ask] breaker open · day spend ${gate.spentUsd.toFixed(4)} USD`);
      return json({ state: "resting", ...decline(STATIC.resting) }, 429);
    }
    return json(
      {
        state: "rate_limited",
        ...decline(gate.reason === "session" ? STATIC.rateLimitedSession : STATIC.rateLimitedIp),
      },
      429,
    );
  }

  // ---- the call -----------------------------------------------------------
  const client = new OpenAI({ apiKey: rails.apiKey, baseURL: XAI_BASE_URL });
  const messages = buildMessages(GROUNDING_PACK, history);

  let reply: Reply | null = null;
  let problem: string | null = null;
  let totalUsd = 0;
  let attempts = 0;
  let schemaEnforced = true;

  try {
    // One retry, and only one. chatbot-spec: schema-enforced output should not
    // need a parsing retry; the retry exists for the cases the schema cannot
    // cover, which are a hallucinated slug and an off-site citation.
    for (let attempt = 0; attempt < 2 && !reply; attempt++) {
      attempts = attempt + 1;
      const turn = problem
        ? [
            ...messages,
            {
              role: "user" as const,
              content:
                "That reply did not fit the required JSON shape, or it cited something that is not in the pack. Answer again, using only pages that appear in the pack.",
            },
          ]
        : messages;

      const call = await complete(client, rails.model, turn, sessionId, schemaEnforced);
      schemaEnforced = call.schemaEnforced;
      totalUsd += costOf(call.usage).usd;

      if (call.stop === "refusal") {
        reply = decline(STATIC.refused);
        break;
      }
      if (call.stop === "length") {
        reply = decline(STATIC.tooLong);
        break;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(call.text);
      } catch {
        problem = "reply was not JSON";
        continue;
      }
      const validated = validateReply(parsed, SITE_HOST);
      if (!validated.ok) {
        problem = validated.problem;
        continue;
      }
      const refs = checkKnownRefs(validated.reply, KNOWN);
      if (!refs.ok) {
        problem = refs.problem;
        continue;
      }
      reply = validated.reply;
    }
  } catch (error) {
    // Provider errors never reach the visitor as themselves. The message can
    // carry a request id, an account hint, or the model's own reasoning about
    // why it stopped, and none of that is a visitor's business.
    console.error("[ask] provider call failed:", error instanceof Error ? error.name : "unknown");
    reply = decline(STATIC.providerError);
  }

  if (!reply) reply = decline(STATIC.providerError);

  // ---- accounting ---------------------------------------------------------
  let spentToday = gate.spentUsd;
  if (totalUsd > 0) {
    try {
      spentToday = await recordSpend(rails.store, totalUsd);
    } catch {
      // Losing the write is a metering failure, not a reason to hide it.
      console.error("[ask] spend write failed; the day's total is now under-counted");
    }
  }

  // Counts and money only. No question, no answer, no address.
  console.log(
    `[ask] ok · attempts ${attempts} · schema ${schemaEnforced ? "enforced" : "prompted"} · ` +
      `blocks ${reply.blocks.length} · call ${totalUsd.toFixed(6)} USD · day ${spentToday.toFixed(4)} USD`,
  );

  return json(
    {
      state: "ok",
      blocks: reply.blocks satisfies ReplyBlock[],
      sessionRemaining: Math.max(0, RAILS.sessionMessages - gate.sessionUsed),
    },
    200,
  );
}

type CallResult = {
  text: string;
  usage: Usage | null;
  stop: "ok" | "length" | "refusal";
  schemaEnforced: boolean;
};

/**
 * One provider call.
 *
 * BUILD-VERIFIED 2026-08-11: grok-4.5 takes OpenAI-shaped
 * `response_format: {type: "json_schema", json_schema: {name, schema, strict}}`
 * (https://docs.x.ai/developers/model-capabilities/text/structured-outputs).
 * If a future account or model rejects that parameter, this drops to plain JSON
 * mode ONCE rather than failing the request: the same schema is written out in
 * the system prompt, and validateReply() is the real gate either way. The
 * response says which path ran, and so does the log line.
 *
 * `x-grok-conv-id` is xAI's documented way to raise the prefix cache hit rate
 * (https://docs.x.ai/developers/advanced-api-usage/prompt-caching). It is a
 * header, not prompt content, so it cannot disturb the stable prefix, and the
 * session id it carries is an opaque token the browser made up.
 */
async function complete(
  client: OpenAI,
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  conversationId: string,
  schemaEnforced: boolean,
): Promise<CallResult> {
  const base = {
    model,
    messages,
    max_tokens: RAILS.maxTokens,
    temperature: 0.2,
  };
  const options = {
    timeout: REQUEST_TIMEOUT_MS,
    headers: { "x-grok-conv-id": conversationId },
  };

  const run = (enforced: boolean) =>
    client.chat.completions.create(
      {
        ...base,
        response_format: enforced
          ? {
              type: "json_schema" as const,
              json_schema: { name: "ask_reply_v1", strict: true, schema: REPLY_JSON_SCHEMA },
            }
          : { type: "json_object" as const },
      },
      options,
    );

  let completion;
  try {
    completion = await run(schemaEnforced);
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = String((error as { message?: string }).message ?? "");
    if (schemaEnforced && status === 400 && /json_schema|response_format|schema/i.test(message)) {
      console.error("[ask] provider rejected json_schema; falling back to JSON mode for this call");
      completion = await run(false);
      schemaEnforced = false;
    } else {
      throw error;
    }
  }

  const choice = completion.choices[0];
  const usage = (completion.usage ?? null) as Usage | null;
  if (choice?.message?.refusal || choice?.finish_reason === "content_filter") {
    return { text: "", usage, stop: "refusal", schemaEnforced };
  }
  if (choice?.finish_reason === "length") {
    return { text: "", usage, stop: "length", schemaEnforced };
  }
  return { text: choice?.message?.content ?? "", usage, stop: "ok", schemaEnforced };
}
