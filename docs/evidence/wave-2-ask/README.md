# Wave 2 — Ask dock. Evidence.

What was run, what it measured, and what is still not proven.

## Gate tallies

Run on the built app, 2026-08-11.

| Gate | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | compiled; `/api/ask` is the one dynamic route |
| `verify-seo` | **16/17**, 1 UNPROVEN (check 10, the client-name denylist — no local secret) |
| `verify-visual` | **16/16**, legacy parity **0px** across all five archived routes |
| `verify-chrome` | **all passed** — 63.8fps at 1440, 61.7fps at 375, field peak 0.169 of 0.45 |
| `verify-tokens` | **5/5** |
| `verify-fixtures` | **19/19** |
| `verify-ask --offline` | **24/25**, 1 UNPROVEN (the same missing denylist secret) |
| `verify-ask --live` | **NOT_RUN** — no `XAI_API_KEY` in the environment. Nothing was called and nothing is claimed. |

The two UNPROVEN rows are the same fact reported twice: `.seo-denylist.txt` is
gitignored and this machine has no `CLIENT_DENYLIST`. Both gates fail closed and
both fail the run under `CI=true`, where the workflow materializes the file from
the repository secret first. UNPROVEN is not a pass.

### The pack's denylist gate, shown refusing

A gate verified only on the permitted case has not been verified. This one was
driven through all three of its states before it was trusted, by swapping
`.seo-denylist.txt` and re-running:

| `.seo-denylist.txt` | Result |
|---|---|
| absent, or 0 terms with the placeholder marker | **UNPROVEN** — never a pass, and fatal under `CI=true` |
| one term that does not appear in the pack | **PASS** — 25/25 |
| one term that does appear in the pack | **FAIL** — `pack matched denylist entry #1 (sha256:f1750a3fbed7)` |

The failing run prints the entry number and a hash. The term itself never
reaches the log, which is the whole point of hashing it: a CI log is a public
surface too.

`verify-seo` grew a check in this wave: **16. No title repeats "James Brady"**.
The home route's `<title>` said the name twice, because its title IS the site
title and the root layout's template appended the name again.
`lib/seo/metadata.ts` now returns an absolute title on `/`, and check 16 is what
keeps it fixed.

## What the live red team would cover, and has not

`docs/specs/chatbot-spec.md § Pre-launch red team` lists six categories:
prompt injection, client-name extraction, hallucination probes, PII probes,
lead spam, cost attack. `scripts/verify-ask.mjs --live` runs nine probes across
all six against the real model and writes the raw replies to
`live-red-team-<date>.md` in this directory, with an empty "Human read:" line
under each for the person who reads them.

**It has not been run.** The offline pass proves the code refuses; it says
nothing about how the model behaves. Run it before the dock is switched on:

```
XAI_API_KEY=... npm run verify:ask:live
```

## Screenshots

Both states, because both ship.

| File | What it shows |
|---|---|
| `dock-rest-off-*.png`, `dock-open-off-*.png` | The dock with the assistant **switched off**: unchanged wave-1 behaviour, terms plus the mailto. This is what is live the moment the PR merges. |
| `dock-rest-on-1440.png`, `dock-open-on-1440.png` | The dock with the rails present: the panel opens instead of the terms text. |
| `ask-blocks-on-1440.png` | Every REPLY_SCHEMA v1 block rendered: text, the sources list, a work chip, a theory chip, the reach-James card, and a decline. |
| `ask-reach-on-1440.png` | The reach-James form open, with its consent tick. |
| `*-375.png` | The same at 375, where the panel is full width minus the gaps. |

The "on" screenshots were taken against `scripts/ask-stub.mjs`, a local stub
that speaks the Upstash REST protocol and returns one fixed reply using every
block type. It exists to exercise the RENDERER without a key. It is not
deployed, it is not imported by the app, and it is not evidence about the model.

## Measured, in the browser, at 1440 and 375

- The panel mounts as `role="dialog" aria-modal="true"`.
- The focus trap holds across 25 consecutive Tab presses at both widths.
- Escape closes the panel and returns focus to the pill (`dock__hit`).
- Zero console errors on load in both states.
- `verify-visual` re-confirms the footer still reserves the dock's 96px and
  that there is no horizontal overflow at either width.

## A defect this build found and fixed

`GET /api/ask` answered 503 with a chunked body, and the dock tested
`response.ok` without reading it. An undrained response stream never finishes,
so **every headless check waiting for network idle hung on it** —
`verify-visual` timed out at 30s on the home route. Two fixes: the route sets an
explicit `content-length`, and the dock no longer probes at all — the server
layout reads the rails at build and hands the dock a boolean.

## Not proven

- The model's behaviour under any of the six red-team categories. NOT_RUN.
- Client confidentiality in the pack. The denylist gate scans it, and the gate
  has no terms to scan for until the `CLIENT_DENYLIST` secret exists.
- Anything about a deployed environment. No deploy was made and none is claimed.
