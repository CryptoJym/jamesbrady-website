# Gate fixtures

Hostile inputs, one per file, each of which a gate in this repo MUST catch.
`scripts/verify-fixtures.mjs` asserts every one of them is caught — a fixture
that stops failing is itself a failure, because it means the gate was widened.

The `h3ro-f*` fixtures are the four cases the independent review (2026-08-11)
constructed against the retired-brand gate. Each contains the token OUTSIDE any
allowlisted URL.

MEASURED against the old token-global scanner on 2026-08-11, so the claim is
exact rather than rhetorical:

| fixture | old gate | new gate |
|---|---|---|
| F4 brand copy in prose ("the h3ro-dev collective") | **0 hits — PASSED** | caught |
| F5 bare handle away from its link ("@h3ro.ai") | **0 hits — PASSED** | caught |
| F6 token in a component name | 4 hits — caught | caught |
| F7 retired domain as a destination | caught | caught |

F4 and F5 are the two the old allowlist actually let through. F6 and F7 are
kept as regression fixtures: they are the cases a future "simplification" would
break first.

`h3ro-allowed.txt` is the control — the permitted shapes, which must NOT be
flagged, so the fix cannot be "reject everything".

On 2026-09-27 the accepted Fulgurite design, grown from the public GitHub
record, needed two more shapes of the same org-infrastructure fact: the
repository URL printed without its scheme (`github.com/h3ro-dev/borg`) and the
repository's full name (`h3ro-dev/eegt`). Both joined the control.
`h3ro-f11-shape-edges.txt` is the other half: the bare org name as prose, an
`http://` link, a lookalike host, `www.github.com`, an `@`-scope, a slash with
no repository after it, the org's pages without a scheme and the org page with
no repository. Each line is asserted on its own, so none can pass by sharing a
file with a hit.

`H3RO_SOURCE_FACTS` in `scripts/lib/h3ro-gate.mjs` pins one sentence in the
source, by file and exact text, that names the org's GitHub account in prose
(the history snapshot's method line). The fixtures show the pin allows it in
that file only, and that a reworded sentence in the same file is caught.

The `md-*` fixtures cover the markdown renderer: link schemes it must refuse to
turn into anchors, and the two ways a `[JAMES: …]` gap used to break.

The `tokens-f*` fixtures (wave 2) cover `scripts/lib/token-gate.mjs`, the
"no colour literal outside `:root`" rule from design-system-spec §7.2. It had
been prose for a whole wave, which caught nothing; it became code when
`app/icon.svg` needed the first exemption to it.

| fixture | must be |
|---|---|
| F8 a hex on a component rule | caught |
| F9 an `rgba()` on a component rule | caught |
| F10 an *allowlisted* asset whose literal drifted one digit off `--sig` | caught |
| `tokens-allowed.css` (control) | silent — tokens, `:root`, the `@media print` re-bind and a comment quoting a value are all legal |

F10 is the one that matters. An allowlist that only *allows* is how an exempt
brand asset drifts off the palette with nobody watching; this gate grants the
exemption and then pins the literal to the token it froze. The shipped
`app/icon.svg` and `components/specimen/Specimen.tsx` (whose WebGL bead colour
is `--bead` in `app/fg.css`) are asserted clean against the same check, so the
controls and the hostile case are the same code path.

Fixtures are DATA. Nothing here is imported by the app.
