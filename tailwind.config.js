/** @type {import('tailwindcss').Config} */
//
// design-system-spec §2.2: every entry reads a CSS variable and never restates
// a value. The media-query re-declarations of --gutter, --s-9, --s-10 and
// --dock-gap in globals.css make every utility built on them responsive for
// free, with no breakpoint variants in markup.
//
// §2.3: opacity modifiers are banned on token colors. Tailwind 3 cannot apply
// `bg-sig/10` to a hex delivered through var() (no <alpha-value> channel).
// Use the pre-mixed --sig-wash / --sig-edge / --warn-wash. A new alpha means a
// new named token in :root, never an inline rgba().
//
// LEGACY ISOLATION (independent review, P1-2). This file is shared with the
// five archived routes, which are built entirely out of Tailwind utilities.
// Any key here that COLLIDES with a Tailwind default silently re-renders those
// pages. The colliding keys are therefore banned outright:
//
//   spacing 1..10        → would move p-8 from 32px to 64px, mb-10 40px → 128px
//   borderRadius sm/md   → would move rounded-sm 2px → 3px, rounded-md 6px → 5px
//   letterSpacing tight  → would move tracking-tight -.025em → -.032em
//   transitionDuration.DEFAULT / transitionTimingFunction.DEFAULT
//                        → would move every bare `transition` off 150ms/ease
//   fontFamily.mono      → must stay on the Geist stack the legacy footer uses
//   colors.base          → CROSS-SCALE: `text-base` is a default FONT SIZE, so
//                          a colour named `base` emits a second `.text-base`
//                          rule that repaints every heading using it
//
// Direction B needs none of them: every new surface is styled from
// app/globals.css against var(--*) directly and uses ZERO Tailwind utilities.
//
// The gate that actually holds this is verify-visual's legacy pixel-diff: it
// builds `main` in a worktree and requires ZERO differing pixels on all five
// archived routes. Reading this file is not how the colours.base collision was
// found — the pixel diff found it, in a 16px band on /manuscript.
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts}",
    "./lib/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOT `base`. `text-base` is Tailwind's default 1rem FONT SIZE, and a
        // colour named `base` generates a second `.text-base` rule that wins
        // on source order — measured: it repainted every `text-base` heading
        // on the archived routes from #E8E4DD to #0A0E11, invisible in a diff
        // and caught only by the legacy pixel gate. Cross-SCALE collisions are
        // the ones that hide.
        canvas: 'var(--c-base)',
        panel: 'var(--c-panel)',
        raised: 'var(--c-raised)',
        inset: 'var(--c-inset)',
        void: 'var(--c-void)',
        line: 'var(--c-line)',
        line2: 'var(--c-line-2)',
        lineHot: 'var(--c-line-hot)',
        edge: 'var(--c-edge-int)',
        hi: 'var(--t-hi)',
        mid: 'var(--t-mid)',
        lo: 'var(--t-lo)',
        faint: 'var(--t-faint)',
        sig: 'var(--sig)',
        sigDeep: 'var(--sig-deep)',
        sigWash: 'var(--sig-wash)',
        sigEdge: 'var(--sig-edge)',
        warn: 'var(--warn)',
        warnWash: 'var(--warn-wash)',
        inkOnSig: 'var(--ink-on-sig)',

        // LEGACY — consumed only by /primer, /manuscript, /workshop, /links
        // and /watch, which keep their current skin this wave. New Direction B
        // surfaces must not reference these.
        gold: { DEFAULT: '#D4A853', light: '#E5C87A', dark: '#B8923D' },
        surface: { DEFAULT: '#0A0A0A', raised: '#141414', border: '#1E1E1E' },
      },
      fontSize: {
        nano: 'var(--ts-nano)',
        micro: 'var(--ts-micro)',
        small: 'var(--ts-small)',
        body: 'var(--ts-body)',
        lead: 'var(--ts-lead)',
        h3: 'var(--ts-h3)',
        h2: 'var(--ts-h2)',
        serifMd: 'var(--ts-serif-md)',
        value: 'var(--ts-value)',
        h1: 'var(--ts-h1)',
      },
      letterSpacing: {
        label: 'var(--track-label)',
        data: 'var(--track-data)',
        display: 'var(--track-display)',
        // NOT `tight` — that is a Tailwind default the legacy footer uses.
        dispTight: 'var(--track-tight)',
      },
      // Namespaced away from Tailwind's own spacing scale: `s1`..`s10`, never
      // `1`..`10`. A Direction B utility would read `p-s8`; the legacy `p-8`
      // keeps Tailwind's 32px.
      spacing: {
        s1: 'var(--s-1)',
        s2: 'var(--s-2)',
        s3: 'var(--s-3)',
        s4: 'var(--s-4)',
        s5: 'var(--s-5)',
        s6: 'var(--s-6)',
        s7: 'var(--s-7)',
        s8: 'var(--s-8)',
        s9: 'var(--s-9)',
        s10: 'var(--s-10)',
        gutter: 'var(--gutter)',
        dock: 'var(--dock-size)',
        dockGap: 'var(--dock-gap)',
        dockReserve: 'var(--dock-reserve)',
      },
      borderRadius: { bSm: 'var(--r-sm)', bMd: 'var(--r-md)' },
      maxWidth: { page: 'var(--maxw)' },
      fontFamily: {
        inst: ['var(--f-inst)'],
        instMono: ['var(--f-mono)'],
        paper: ['var(--f-paper)'],
        // LEGACY only — the archived routes' footer stamp uses `font-mono`.
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      transitionDuration: { 600: '600ms', 800: '800ms' },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
