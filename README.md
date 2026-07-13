# James Brady — Founder and AI Systems Builder

Source for [jamesbrady.org](https://www.jamesbrady.org), a proof-led personal site about AI-native products, agent operating systems, and accountable human-and-AI workflows.

## Product and design contracts

- `PRODUCT.md` defines the audience, purpose, personality, anti-references, and accessibility commitment.
- `DESIGN.md` defines the visual system and implementation guardrails.
- `.impeccable/design.json` exposes the design tokens and canonical component examples to design-aware tools.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 3
- Geist Sans and Geist Mono

## Local development

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm run typecheck
npm run lint
npm run build
```

## Lead delivery

The homepage and `/contact` forms use a Server Action to send inquiries through the shared Utlyze lead gateway. The visible form asks for only three required fields; optional routing fields are normalized to safe defaults on the server. No CRM credential is exposed in this repository.

Set `LEAD_INGEST_URL` only for a local or staging override. Never expose it with a `NEXT_PUBLIC_` prefix.
