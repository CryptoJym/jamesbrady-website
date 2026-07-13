---
name: James Brady
description: A proof-led personal site for an inventive founder building accountable AI-native systems.
colors:
  signal: "#D94A2E"
  signal-strong: "#B93620"
  ink: "#171A1B"
  ink-muted: "#5E6864"
  paper: "#F4F5F2"
  paper-raised: "#FFFFFF"
  rule: "#CDD3CF"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 8.5vw, 8.5rem)"
    fontWeight: 650
    lineHeight: 0.88
    letterSpacing: "-0.07em"
  headline:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 0.96
    letterSpacing: "-0.055em"
  title:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "clamp(1rem, 1vw, 1.125rem)"
    fontWeight: 450
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "72px"
  4xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-strong}"
    textColor: "{colors.paper-raised}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "13px 17px"
    height: "48px"
  field:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
    height: "52px"
  proof-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 10px"
---

# Design System: James Brady

## Overview

**Creative North Star: "The Working Thesis"**

The site is a published operating notebook, not a showroom. It should feel like James opened the workbench and made the reasoning legible: large direct statements, visible evidence, technical annotations, and a clear path from belief to built system. The surface is cool paper, the typography is ink, and Signal Vermilion marks the small number of details that demand action.

This system is inventive through composition and proof, exacting through alignment and state language, and candid through unvarnished copy. It explicitly rejects generic black-and-gold AI luxury, glassy futurist dashboards, crypto and neon grids, mystical tech symbolism, safe corporate-consultant templates, resume-style founder sites, generic SaaS card grids, editorial-magazine affectation used as a default, and vague claims without visible proof.

**Key Characteristics:**

- One dominant idea per viewport, written in plain language.
- Flat paper-and-ink surfaces with visible rules instead of decorative depth.
- Real work, artifacts, and named operating principles as the visual material.
- Asymmetric but disciplined layouts that collapse cleanly on small screens.
- Motion only for orientation, feedback, and state change; never spectacle.

## Colors

The palette behaves like a marked-up technical sheet: cool neutral paper, dense ink, and one rare vermilion signal.

### Primary

- **Signal Vermilion:** The action and evidence marker. Use for active states, proof annotations, small rules, and the occasional decisive word; it must never become a background wash.
- **Pressed Vermilion:** The active and high-contrast companion for hover, pressed, and small-text situations.

### Neutral

- **Working Ink:** Primary text, structural buttons, and decisive rules.
- **Pencil Gray:** Secondary text, metadata, and supporting explanations only.
- **Drafting Paper:** The default page surface.
- **Clean Sheet:** Raised form fields and the rare inset proof surface.
- **Construction Rule:** Dividers, field borders, and quiet layout structure.

### Named Rules

**The Ten-Percent Signal Rule.** Signal Vermilion may occupy no more than ten percent of a viewport. Its rarity is what makes it useful.

**The No Atmosphere Rule.** Gradients, colored glows, fog, noise overlays, and tinted glass are prohibited. Color must communicate identity or state.

## Typography

**Display Font:** Geist Sans (with system-ui and sans-serif fallbacks)

**Body Font:** Geist Sans (with system-ui and sans-serif fallbacks)

**Label/Mono Font:** Geist Mono (with ui-monospace and monospace fallbacks)

**Character:** A single technical-humanist family keeps the voice contemporary and direct. Scale, weight, and rhythm create distinction; a decorative serif is unnecessary and would push the site back toward editorial affectation.

### Hierarchy

- **Display** (650, fluid 3.5–8.5rem, 0.88): One short thesis in a hero. Keep it to roughly two or three lines at the intended viewport.
- **Headline** (650, fluid 2–4.5rem, 0.96): Section claims and proof-led transitions.
- **Title** (650, 1.25rem, 1.15): Project, principle, and resource titles.
- **Body** (450, fluid 1–1.125rem, 1.6): Explanations, outcomes, and context. Prose width must remain between 55ch and 72ch.
- **Label** (600, 0.75rem, 0.02em): Dates, states, evidence types, and system annotations. Use sentence case; never use widely tracked all-caps as decoration.

### Named Rules

**The Say-It-Once Rule.** A thesis gets one large statement, not a large statement plus an eyebrow that repeats it.

**The No Editorial Costume Rule.** Decorative italics, ornamental drop caps, and serif display treatments are forbidden unless the content itself is a long-form publication.

## Elevation

The system is flat by default. Depth comes from tonal contrast, one-pixel construction rules, spacing, and the occasional inset surface—not floating cards. Shadows are omitted at rest. Interactive elements may shift by one or two pixels, but they may not acquire diffuse glows or cinematic depth.

### Named Rules

**The Workbench Rule.** If a surface cannot explain why it is separate, remove the container and use spacing or a rule.

**The No Floating Glass Rule.** Backdrop blur, translucent floating shells, and ambient shadow stacks are prohibited.

## Components

### Buttons

- **Shape:** Compact, lightly machined corners (6px) and a minimum 48px height.
- **Primary:** Working Ink with Clean Sheet text, 14px by 18px internal padding. The hover state changes to Signal Vermilion.
- **Hover / Focus:** A 160ms color transition to Pressed Vermilion and a 3px offset, 2px Signal Vermilion focus outline. A one-pixel upward shift is allowed on hover; state cannot depend on motion.
- **Secondary:** Clean Sheet with a one-pixel Construction Rule border and Working Ink text. Text links use a persistent one-pixel underline rather than a pill shell.

### Chips

- **Style:** Drafting Paper, Working Ink, and a one-pixel Construction Rule border. Sentence-case mono labels identify proof state or artifact type.
- **State:** Selected chips invert to Working Ink and Clean Sheet. Chips are filters or evidence labels, never decorative taxonomy confetti.

### Cards / Containers

- **Corner Style:** Restrained corners (6–12px), used only when a real grouped surface is necessary.
- **Background:** Drafting Paper at page level and Clean Sheet for form or artifact surfaces.
- **Shadow Strategy:** None at rest; see Elevation.
- **Border:** One-pixel Construction Rule. Featured work uses a stronger top rule, never a colored side stripe.
- **Internal Padding:** 24px on compact surfaces, 32–48px on primary proof surfaces.

### Inputs / Fields

- **Style:** Clean Sheet background, one-pixel Construction Rule border, 6px corners, 16px horizontal padding, and at least 52px height.
- **Focus:** Working Ink text with a Signal Vermilion border and 2px offset focus outline.
- **Error / Disabled:** Errors pair a written explanation with a red border; never rely on color alone. Disabled fields retain readable contrast and identify their state in text.

### Navigation

Use a full-width, non-floating header with a bottom construction rule. The wordmark is plain text. Links use 14px sentence-case labels, visible current-page state, and 44px minimum targets. On mobile, the menu opens as an opaque paper sheet with immediate focus management; no glass, blur, or staggered choreography.

### Proof Ledger

The signature component is a full-width evidence row: state and date in the left rail, a plain-language claim in the center, and a direct artifact or result on the right. Rows share horizontal rules rather than individual card shells. On small screens the rail stacks above the claim while preserving reading order.

## Do's and Don'ts

### Do:

- **Do** make the “Of One” thesis concrete with operating diagrams, named systems, shipped artifacts, and clear outcomes.
- **Do** use Signal Vermilion as a rare action or evidence marker and keep it below ten percent of the viewport.
- **Do** preserve visible keyboard focus, semantic headings, 44px touch targets, and reduced-motion behavior.
- **Do** use real project states such as built, operating, source-ready, or live-verified only when the accompanying proof supports them.
- **Do** remove a container when a one-pixel rule or 32–72px of spacing can establish the relationship.

### Don't:

- **Don't** use generic black-and-gold AI luxury.
- **Don't** use glassy futurist dashboards, backdrop blur, translucent navigation shells, or ambient glow.
- **Don't** use crypto and neon grids or mystical tech symbolism.
- **Don't** fall back to safe corporate-consultant templates or resume-style founder sites.
- **Don't** arrange every idea as a generic SaaS card grid.
- **Don't** use editorial-magazine affectation as a default or repeat tiny uppercase eyebrow labels above every heading.
- **Don't** make vague claims without visible proof.
- **Don't** use a border-left greater than 1px as a colored stripe; featured content gets a top rule or a complete border.
- **Don't** animate text with blur, shimmer, glow pulses, or entrance choreography. Motion is feedback, not atmosphere.
