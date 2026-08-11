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
        base: 'var(--c-base)',
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
        tight: 'var(--track-tight)',
      },
      spacing: {
        1: 'var(--s-1)',
        2: 'var(--s-2)',
        3: 'var(--s-3)',
        4: 'var(--s-4)',
        5: 'var(--s-5)',
        6: 'var(--s-6)',
        7: 'var(--s-7)',
        8: 'var(--s-8)',
        9: 'var(--s-9)',
        10: 'var(--s-10)',
        gutter: 'var(--gutter)',
        dock: 'var(--dock-size)',
        dockGap: 'var(--dock-gap)',
        dockReserve: 'var(--dock-reserve)',
      },
      borderRadius: { sm: 'var(--r-sm)', md: 'var(--r-md)' },
      maxWidth: { page: 'var(--maxw)' },
      fontFamily: {
        inst: ['var(--f-inst)'],
        mono: ['var(--f-mono)'],
        paper: ['var(--f-paper)'],
        // LEGACY only.
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: { DEFAULT: 'var(--dur)', 600: '600ms', 800: '800ms' },
      transitionTimingFunction: {
        DEFAULT: 'var(--ease)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
