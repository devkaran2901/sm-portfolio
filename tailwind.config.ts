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
        // Surfaces: neutral grey ground, white cards. No blue cast.
        ink: {
          950: '#D9DADC', // page background
          900: '#FFFFFF', // cards, panels, admin sidebar
          800: '#E8E9EA', // dividers and hover fills
          700: '#C9CBCD', // default borders
          600: '#B4B6B9', // stronger borders
          500: '#7A7C7F', // icons and faint marks
          400: '#5A5C5F',
          tint: '#CFD0D2',
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
          50: '#0A0A0B', // headings
          100: '#141516',
          200: '#202124', // body copy
          300: '#2C2E31', // secondary copy
          400: '#3A3C3F', // muted copy
          500: '#45474A', // captions
          600: '#4E5053', // faintest labels
        },
        /*
         * Accents are neutral greys, not colours. The palette is deliberately
         * black / grey / white, so what used to be turf green and brass gold now
         * read as tone alone - the same scale positions, none of the hue.
         */
        turf: {
          50: '#0A0A0B',
          100: '#141516',
          200: '#1A1B1D', // accent text
          300: '#26282B',
          400: '#33363A', // dots and markers
          500: '#3A3D41', // fills (carries a white checkmark)
          600: '#8E9195', // avatar fill under near-black text
          700: '#B4B6B9',
          800: '#D2D4D6',
          900: '#E8E9EA', // faint tints
        },
        brass: {
          50: '#0A0A0B',
          100: '#141516', // link hover
          200: '#1F2124', // accent text and links
          300: '#3A3C3F', // eyebrows
          400: '#B4B6B9', // borders
          500: '#C9CBCD',
          600: '#DCDDDF',
          700: '#EDEEEF', // tinted fills
        },
        // Error state keeps its hue: red carries meaning that grey cannot.
        danger: { 400: '#93291D', 500: '#C0392B', 600: '#B32D1C' },
        info: { 400: '#3A3C3F', 500: '#7A7C7F' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      /*
       * Anton is condensed, so the large sizes previously carried heavy negative
       * tracking and closed up. display-sm reads best, and the larger steps are
       * now tuned to sit near it optically rather than tightening as they grow.
       */
      fontSize: {
        'display-xl': ['clamp(2.75rem, 10.5vw, 9rem)', { lineHeight: '0.95', letterSpacing: '0.005em' }],
        'display-lg': ['clamp(2.25rem, 6.8vw, 5.5rem)', { lineHeight: '1.0', letterSpacing: '0em' }],
        'display-md': ['clamp(1.75rem, 4.6vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.008em' }],
        'display-sm': ['clamp(1.4375rem, 3.1vw, 2.25rem)', { lineHeight: '1.14', letterSpacing: '-0.015em' }],
        eyebrow: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.2em' }],
      },
      maxWidth: { shell: '100rem', prose: '72ch' },
      spacing: { section: 'clamp(3.25rem, 9vw, 8.5rem)' },
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
