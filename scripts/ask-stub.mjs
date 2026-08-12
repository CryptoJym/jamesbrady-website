#!/usr/bin/env node
// LOCAL QA STUB. Never deployed, never imported by the app.
//
//   node scripts/ask-stub.mjs
//   XAI_API_KEY=stub XAI_BASE_URL=http://127.0.0.1:4311/v1 \
//   UPSTASH_REDIS_REST_URL=http://127.0.0.1:4311/kv UPSTASH_REDIS_REST_TOKEN=stub \
//   npx next start -p 4123
//
// Speaks two protocols on one port so the Ask dock can be driven end to end
// with no key and no Redis:
//
//   POST /kv/pipeline      Upstash REST, in memory, for this process only
//   POST /v1/chat/completions   a fixed reply using every REPLY_SCHEMA v1 block
//
// The point is the RENDERER. Screenshotting a decline block proves the panel
// mounts; screenshotting all six block types proves each one has a component
// and that an unknown type degrades to text. The model's own behaviour is the
// --live pass in verify-ask, which this does not stand in for.

import { createServer } from "node:http";

const PORT = Number(process.env.ASK_STUB_PORT ?? 4311);
const store = new Map();

const REPLY = {
  blocks: [
    {
      type: "text",
      markdown:
        "The visibility platform measures how findable a business is in search and in AI answers. " +
        "Each client's data is walled off from every other client's, and the method behind every " +
        "figure is stated on the page. One figure is still `[pending]`.",
    },
    {
      type: "sources",
      pages: [
        { title: "The visibility platform", url: "https://www.jamesbrady.org/work/visibility-platform" },
        { title: "Work index", url: "https://www.jamesbrady.org/work" },
      ],
    },
    { type: "project_ref", slug: "visibility-platform", blurb: "The case study, with its proof block." },
    {
      type: "theory_ref",
      slug: "universal-question-geometry",
      blurb: "The theory the scoring rubric came out of.",
    },
    { type: "reach_james", reason: "You asked about working together on something like this." },
    { type: "decline", message: "The revenue figure behind it is not published, so there is nothing to quote." },
  ],
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const send = (status, body) => {
    const text = JSON.stringify(body);
    response.writeHead(status, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(text),
    });
    response.end(text);
  };

  if (url.pathname === "/kv/pipeline") {
    const commands = JSON.parse(await read(request));
    return send(
      200,
      commands.map(([verb, key, arg]) => {
        if (verb === "INCR") {
          const next = (Number(store.get(key)) || 0) + 1;
          store.set(key, next);
          return { result: next };
        }
        if (verb === "INCRBYFLOAT") {
          const next = (Number(store.get(key)) || 0) + Number(arg);
          store.set(key, next);
          return { result: next };
        }
        if (verb === "GET") return { result: store.has(key) ? Number(store.get(key)) : null };
        return { result: 1 };
      }),
    );
  }

  if (url.pathname === "/v1/chat/completions") {
    await read(request);
    return send(200, {
      id: "stub",
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(REPLY) } }],
      usage: {
        prompt_tokens: 19_000,
        completion_tokens: 240,
        prompt_tokens_details: { cached_tokens: 18_400 },
      },
    });
  }

  send(404, { error: "not a stubbed route" });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`ask stub on http://127.0.0.1:${PORT} — /kv and /v1`);
});

function read(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => resolve(body || "[]"));
  });
}
