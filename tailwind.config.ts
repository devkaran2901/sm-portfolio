import type { Config } from 'tailwindcss';

/**
 * Design language: Premium + Editorial + Sports + Executive.
 *
 * The palette is keyed to ROLE, not to literal lightness, which is what lets the
 * whole site change ground without touching a single component:
 *
 *   ink   = surfaces. Higher numbers sit further back (950 is the page itself,
 *           900/800 are raised cards and dividers, 700/600 are borders).
 *   bone  = content. Lower numbers read strongest (50 is a heading, 500 is a
 *           caption).
 *   turf / brass / danger / info = accents, following the same convention:
 *           low numbers are text, high numbers are fills and tints.
 *
 * Every component already uses `bg-ink-*` for surfaces and `text-bone-*` for
 * copy, so the values below define the theme in one place.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces: cool light grey ground with near-white cards.
        ink: {
          950: '#C8CED6', // page background
          900: '#F6F7F9', // cards, panels, admin sidebar
          800: '#DCE1E7', // dividers and hover fills
          700: '#BFC6CF', // default borders
          600: '#ADB6C1', // stronger borders
          500: '#7E8792', // icons and faint marks
          400: '#5C646E',
          tint: '#BDC5CE',
        },
        /*
         * Content: near-black through to muted grey.
         *
         * The ground sits at 61% relative luminance, so 4.5:1 forces the whole
         * range darker than a dark theme would need. The steps are compressed
         * rather than extended: every shade here clears AA against ink-950, and
         * hierarchy is carried by the remaining separation.
         */
        bone: {
          50: '#0C0E10', // headings          13.1:1
          100: '#15181B', // 12.0:1
          200: '#22262B', // body copy        10.5:1
          300: '#2F363C', // secondary copy    8.3:1
          400: '#3E454C', // muted copy        6.1:1
          500: '#464D54', // captions          5.4:1
          600: '#4F575F', // faintest labels   4.6:1
        },
        turf: {
          50: '#0A291B',
          100: '#0E3B27',
          200: '#175239', // accent text
          300: '#1E6A47',
          400: '#2C8C5E', // dots and markers
          500: '#3BA372', // fills
          600: '#63BE92',
          700: '#93D6B2',
          800: '#BEE7D1',
          900: '#DCF1E6', // faint tints
        },
        // Gold has to run dark to stay legible on a light ground: the text
        // shades (100-300) all clear AA, while 400+ are borders and fills only.
        brass: {
          50: '#2E2405',
          100: '#3D2F08', // link hover        8.4:1
          200: '#4E3C0B', // accent text       6.6:1
          300: '#5E4910', // eyebrows          5.4:1
          400: '#A8821F', // borders
          500: '#C29B31',
          600: '#D4B65A',
          700: '#E7D394', // tinted fills
        },
        danger: { 400: '#93291D', 500: '#C0392B', 600: '#B32D1C' },
        info: { 400: '#245078', 500: '#3B7CB8' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.25rem, 10vw, 8.5rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.5rem, 6.4vw, 5rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2rem, 4.4vw, 3.25rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.125rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      maxWidth: { shell: '82rem', prose: '68ch' },
      spacing: { section: 'clamp(4rem, 9vw, 8.5rem)' },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(12,14,16,0.05), 0 12px 32px -18px rgba(12,14,16,0.22)',
        lift: '0 2px 4px rgba(12,14,16,0.07), 0 28px 60px -28px rgba(12,14,16,0.30)',
      },
      transitionTimingFunction: { editorial: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translate3d(0, 18px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'line-grow': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-rise': 'fade-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'line-grow': 'line-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
