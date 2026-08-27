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
         * Surfaces: warm near-black ground, warm-black panels, hairline
         * borders - keyed to the reference image, which carries no blue
         * anywhere. (An earlier pass here used a navy-blue-tinted black; every
         * value below replaces that with a neutral, slightly warm black
         * instead, which is what the image actually shows.)
         *
         * Because the scale is keyed to ROLE rather than to literal lightness,
         * the retune happens here and every component that already writes
         * `bg-ink-*` follows it without being touched. 950 is the page itself,
         * 900 the panel black, 800/700/600 the dividers and borders - each one
         * a white wash over the ground - and 500/400 are icon and faint-mark
         * colours rather than surfaces.
         */
        ink: {
          950: '#0B0A08', // page background
          900: '#161310', // cards, panels
          800: '#211D17', // dividers and hover fills
          700: '#2E2820', // default borders (~white 12% over the ground)
          600: '#463D2E', // stronger borders
          500: '#8F8570', // icons and faint marks
          400: '#A89C84',
          tint: '#0D0B08', // the wash on raised sections
        },
        /*
         * Content: warm off-white through to warm muted taupe.
         *
         * Every step clears AA against ink-950 - 50 at 17+:1 down to 600 at
         * 5:1 - so hierarchy is carried by the separation between steps and
         * nothing in the range needs a size exemption to be legible.
         */
        bone: {
          50: '#F8F5EE', // headings
          100: '#ECE7DB',
          200: '#DFD9CA', // body copy
          300: '#C4BBA6', // secondary copy
          400: '#A79C84', // muted copy
          500: '#93876E', // captions
          600: '#867A61', // faintest labels
        },
        /*
         * Neutrals with a trace of warmth: markers, rings and the quieter
         * chips. The scale runs light to dark like `bone`, so low steps are
         * type on the dark ground and high steps are fills and tints that sit
         * underneath it.
         */
        turf: {
          50: '#F3F1EA',
          100: '#E6E1D4',
          200: '#CEC6B2', // accent text
          300: '#B0A68C',
          400: '#928670', // dots and markers
          500: '#655B47', // fills (carries a white checkmark)
          600: '#4C4434',
          700: '#383225',
          800: '#272219',
          900: '#19160F', // faint tints
        },
        /*
         * The accent, and the only hue on the site: the warm gold from the
         * reference image. The scale runs light to dark, so low steps are type
         * on the dark ground and high steps are fills and washes beneath it.
         * 200 is a link, 300 the eyebrow gold, and 400 is the brand gold
         * itself - rules, dots and solid fills, matched to the saturated gold
         * the image uses for its filled button and the word "LEGACY". Gold is
         * light rather than dark, so white type does NOT sit on a 400 fill at
         * readable contrast; anywhere brass-400 is a solid background, the
         * type on it has to be dark (`ink-950`), which is why the solid button
         * variants carry their own dark-text override rather than inheriting
         * `bone-50`.
         */
        brass: {
          50: '#332608',
          100: '#8A6512', // link hover
          200: '#E6C976', // accent text, links, counters
          300: '#DDBB5C', // eyebrows
          400: '#C9A227', // the brand gold: rules, dots, solid fills
          500: '#A9861F', // pressed, and hover on a solid gold
          600: '#EFDA9E', // eyebrows on a dark fill, where 300 loses contrast
          700: '#2E2408', // tinted fills
        },
        /*
         * The panel black, a shade deeper than the ground it sits on - the
         * same warm neutral as `ink`, not a second hue.
         *
         * Runs deep to pale, the opposite way round to `ink` and `bone`: 950
         * and 900 are surfaces, 200 through 500 are the type that sits on them.
         */
        navy: {
          950: '#060504', // deepest: the closing band and the micro-footer
          900: '#161310', // the standard panel block
          800: '#1E1A15', // a raised panel inside a panel
          700: '#332C22', // borders on navy
          600: '#463D2E',
          500: '#93876E', // faint labels on navy
          400: '#A79C84', // muted copy on navy
          300: '#C4BBA6', // body copy on navy — lifted to match bone
          200: '#F8F5EE', // headings on navy
        },
        /*
         * The one light ground on the site: Press & Recognition. Kept as its
         * own token rather than a `bone` step, because it is a surface and the
         * `bone` scale is content. Warm cream, matched to the one light
         * section in the reference image - not a cool off-white.
         */
        paper: {
          DEFAULT: '#F4F0E6',
          50: '#F8F5EE',
          100: '#F4F0E6', // the section ground
          200: '#E6DFCC', // hairlines and dividers on paper
          300: '#D2C7AC',
          600: '#5C5440', // secondary copy on paper
          700: '#3A3425',
          900: '#171310', // headings on paper
        },
        /*
         * Error state. Red carries the brand as well as the warning now, so
         * these are steps of the same crimson rather than a second hue. The
         * error affordance never depended on colour alone: the messages carry
         * role="alert" and sit against the field they belong to.
         */
        danger: { 400: '#E0705C', 500: '#C0392B', 600: '#96291D' },
        info: { 400: '#A79C84', 500: '#8F8570' },
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
        script: ['var(--font-script)', 'cursive'],
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
        'soft-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'line-grow': 'line-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'soft-bounce': 'soft-bounce 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
