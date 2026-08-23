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
 * copy, so the values below define the theme in one place. The site reads deep
 * navy now, and it moved there by rewriting these values rather than by
 * rewriting the components.
 *
 *   paper = the single light ground (Press & Recognition), and its type.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /*
         * Surfaces: deep navy-black ground, deep navy panels, hairline borders.
         *
         * The site reads dark now. Because the scale is keyed to ROLE rather
         * than to literal lightness, the flip happens here and every component
         * that already writes `bg-ink-*` follows it without being touched.
         * 950 is the page itself, 900 the panel navy, 800/700/600 the dividers
         * and borders - each one a white wash over the ground, so they land as
         * the hairlines the design asks for - and 500/400 are icon and
         * faint-mark colours rather than surfaces.
         */
        ink: {
          950: '#0A0E1A', // page background
          900: '#0E1428', // cards, panels, the secondary navy
          800: '#161E36', // dividers and hover fills
          700: '#222B45', // default borders (~white 12% over the ground)
          600: '#33405E', // stronger borders
          500: '#8892A8', // icons and faint marks
          400: '#A8B2C6',
          tint: '#0B1122', // the wash on raised sections
        },
        /*
         * Content: off-white through to muted slate.
         *
         * Every step clears AA against ink-950 - 50 at 17.6:1 down to 600 at
         * 5.2:1 - so hierarchy is carried by the separation between steps and
         * nothing in the range needs a size exemption to be legible.
         */
        bone: {
          50: '#F5F5F0', // headings
          100: '#E9EAE7',
          200: '#D5D8DE', // body copy
          300: '#B6BCCB', // secondary copy
          400: '#9AA2B5', // muted copy
          500: '#8B94A9', // captions
          600: '#7E8799', // faintest labels
        },
        /*
         * Neutrals with a trace of warmth: markers, rings and the quieter
         * chips. The scale runs light to dark like `bone`, so low steps are
         * type on the dark ground and high steps are fills and tints that sit
         * underneath it.
         */
        turf: {
          50: '#F2F4F2',
          100: '#E4E7E5',
          200: '#CBD1CE', // accent text
          300: '#AEB6B4',
          400: '#8C9598', // dots and markers
          500: '#5E6870', // fills (carries a white checkmark at 4.6:1)
          600: '#46505A',
          700: '#333C46',
          800: '#232B36',
          900: '#161D28', // faint tints
        },
        /*
         * The accent, and the only hue on the site: crimson, taken from the
         * Red Ball mark.
         *
         * The scale runs light to dark, so low steps are type on the dark
         * ground and high steps are fills and washes beneath it. 200 is a link
         * at 6.0:1, 300 the eyebrow red at 4.7:1, and 400 is the brand red
         * itself - rules, dots and solid fills, where white type lands on it at
         * 5.5:1. Nothing above 400 is ever type.
         */
        brass: {
          50: '#F6DBD4',
          100: '#E9917F', // link hover
          200: '#E0705C', // accent text, links, counters
          300: '#D6533C', // eyebrows
          400: '#C0392B', // the brand red: rules, dots, solid fills
          500: '#96291D', // pressed, and hover on a solid red
          600: '#E0705C', // eyebrows on a dark fill, where 300 loses contrast
          700: '#2A1310', // tinted fills
        },
        /*
         * The panel navy, a shade deeper than the ground it sits on.
         *
         * Runs deep to pale, the opposite way round to `ink` and `bone`: 950
         * and 900 are surfaces, 200 through 500 are the type that sits on them.
         */
        navy: {
          950: '#070B16', // deepest: the closing band and the micro-footer
          900: '#0E1428', // the standard panel block
          800: '#141C33', // a raised panel inside a panel
          700: '#232C47', // borders on navy
          600: '#33405E',
          500: '#7E8799', // faint labels on navy
          400: '#9AA2B5', // muted copy on navy
          300: '#B6BCCB', // body copy on navy
          200: '#F5F5F0', // headings on navy
        },
        /*
         * The one light ground on the site: Press & Recognition. Kept as its
         * own token rather than a `bone` step, because it is a surface and the
         * `bone` scale is content.
         */
        paper: {
          DEFAULT: '#F2F1EE',
          50: '#F7F6F4',
          100: '#F2F1EE', // the section ground
          200: '#E4E2DD', // hairlines and dividers on paper
          300: '#CFCCC5',
          600: '#5A5C63', // secondary copy on paper
          700: '#3A3C42',
          900: '#0B0F1E', // headings on paper
        },
        /*
         * Error state. Red carries the brand as well as the warning now, so
         * these are steps of the same crimson rather than a second hue. The
         * error affordance never depended on colour alone: the messages carry
         * role="alert" and sit against the field they belong to.
         */
        danger: { 400: '#E0705C', 500: '#C0392B', 600: '#96291D' },
        info: { 400: '#A8B2C6', 500: '#7E8799' },
      },
      fontFamily: {
        /*
         * `serif` is the display face for the restyle: Playfair Display, a
         * tall high-contrast serif. It is a separate slot rather than a
         * redefinition of `display`, because the scroll hero still paints its
         * name in Anton and that is deliberately left alone.
         */
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        display: ['var(--font-display)', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      /*
       * Tuned for Playfair, which is normal-width rather than condensed, so
       * tracking runs the usual way round: it closes up as the size grows and
       * opens as it drops. The old values were the inverse of this because the
       * face they served was Anton.
       *
       * `eyebrow` is the exception and stays wide - it is set in the sans at
       * 12px in all caps, where the letter-spacing is what makes it read as a
       * label rather than as shouting.
       */
      fontSize: {
        'display-xl': ['clamp(2.75rem, 10.5vw, 9rem)', { lineHeight: '0.94', letterSpacing: '-0.022em' }],
        'display-lg': ['clamp(2.25rem, 6.8vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'display-md': ['clamp(1.875rem, 4.6vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.014em' }],
        'display-sm': ['clamp(1.5rem, 3.1vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.24em' }],
      },
      maxWidth: { shell: '100rem', prose: '72ch' },
      spacing: { section: 'clamp(4.5rem, 8.5vw, 8.75rem)', band: 'clamp(5.5rem, 10vw, 10.5rem)' },
      borderRadius: { xl2: '1.25rem', card: '0.5rem' },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.35), 0 14px 34px -20px rgba(0,0,0,0.75)',
        lift: '0 4px 10px rgba(0,0,0,0.4), 0 34px 70px -30px rgba(0,0,0,0.85)',
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
