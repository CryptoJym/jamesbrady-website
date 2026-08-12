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
// WAVE 4 — THE LEGACY HALF IS GONE. This file used to carry a second palette
// (`gold`, `surface`), a Geist font stack and a warning that certain keys were
// banned because they COLLIDED with Tailwind defaults the archived routes were
// built out of. /primer, /manuscript, /workshop and /watch were reskinned onto
// Direction B at the same URLs, so nothing in this repo renders from a bare
// Tailwind utility any more and there is no second design for a key to
// re-render.
//
// The namespacing STAYS anyway, and the reason is worth keeping: `colors.base`
// emits a second `.text-base` rule, because `text-base` is Tailwind's default
// 1rem FONT SIZE. A cross-scale collision like that is invisible in a diff —
// this one repainted every `text-base` heading on /manuscript and was caught by
// a pixel gate, not by reading. `canvas`, `s1..s10`, `bSm/bMd` and `dispTight`
// cost nothing and keep that class of defect impossible rather than merely
// unlikely.
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
        // NOT `base`. See the cross-scale note above.
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
        // NOT `tight` — that is a Tailwind default.
        dispTight: 'var(--track-tight)',
      },
      // Namespaced away from Tailwind's own spacing scale: `s1`..`s10`, never
      // `1`..`10`.
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
      },
    },
  },
  plugins: [],
};
