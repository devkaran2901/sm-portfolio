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
        /*
         * Surfaces: white ground, white cards, hairline borders.
         *
         * The ground used to be #D9DADC, a mid grey heavy enough to read as a
         * colour in its own right and to drag every card down with it. It is
         * white now, and separation is carried by borders and by the `tint`
         * wash on alternating sections rather than by tone. The two remaining
         * dark steps, 500 and 400, are text and icon colours, not surfaces.
         */
        ink: {
          950: '#FFFFFF', // page background
          900: '#FFFFFF', // cards, panels, admin sidebar, text on dark fills
          800: '#EFEFF1', // dividers and hover fills
          700: '#E2E2E5', // default borders
          600: '#CDCED1', // stronger borders
          500: '#6E7073', // icons and faint marks
          400: '#4A4B4E',
          tint: '#F6F6F7', // the wash on raised sections
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
        /*
         * The one colour on the site. Black, white and a single red, taken
         * from the Red Ball reference.
         *
         * The scale runs dark to light like `bone`, so the low steps are for
         * use on white and the high ones for use on black. 300 is the eyebrow
         * red and clears AA on white at 5.1:1; 600 is its counterpart for dark
         * fills at 7.2:1. Nothing between 400 and 500 is used for text - those
         * are borders, rules and dots.
         */
        /*
         * The dark ground. Navy rather than black, so the dark blocks read as
         * a colour decision next to the red instead of as an absence.
         *
         * Runs deep to pale, the opposite way round to `ink` and `bone`: 950
         * and 900 are surfaces, 200 through 500 are the type that sits on them.
         * Every text step clears AA on navy-900 - 200 at 14.5:1 down to 500 at
         * 5.2:1 - and brass-600 lands on it at 6.3:1, which is what makes a red
         * eyebrow legible over navy.
         */
        navy: {
          950: '#070E1A', // deepest: the footer ground
          900: '#0C1A30', // the standard dark block
          800: '#132743', // a raised panel inside a dark block
          700: '#1E3A5F', // borders on navy
          600: '#2F5480',
          500: '#6E92B8', // faint labels on navy
          400: '#93AECB', // muted copy on navy
          300: '#C4D6E8', // body copy on navy
          200: '#E3EDF6', // headings on navy
        },
        /*
         * The accent, and the only hue on the site: navy, black, white, nothing
         * else.
         *
         * Lighter and more saturated than the `navy` surface steps above, on
         * purpose. A surface navy used as accent type just reads as black - the
         * blue only survives against white if the value is kept up around 300.
         * The scale runs dark to light like `bone`, so low steps sit on white
         * and high steps sit on navy: 300 is the eyebrow at 8.4:1 on white, 600
         * its counterpart at 9.9:1 on navy-900. 400 and 500 are borders, rules
         * and dots, never text.
         */
        brass: {
          50: '#0A1A2E',
          100: '#12365F', // link hover
          200: '#17457E', // accent text, links, counters
          300: '#1D4E89', // eyebrows
          400: '#3E7AB8', // borders, dots, rules
          500: '#6E9DCE',
          600: '#A9C6E4', // eyebrows on dark fills
          700: '#E8F0F8', // tinted fills
        },
        /*
         * Error state, now inside the three-colour rule rather than outside it.
         *
         * This used to be red, on the argument that red carries meaning grey
         * cannot. That is true, and giving it up costs something real: a failed
         * field on the contact form and a delete button in the admin no longer
         * announce themselves by hue. What keeps them legible is that navy is
         * not the colour of body copy - error text at #17457E reads as marked
         * against #202124 - and that the error affordance never depended on
         * colour alone: the messages carry role="alert" and sit against the
         * field they belong to.
         */
        danger: { 400: '#17457E', 500: '#1D4E89', 600: '#12365F' },
        info: { 400: '#3A3C3F', 500: '#7A7C7F' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Haettenschweiler', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      /*
       * Anton is condensed, so tracking runs the opposite way to a normal-width
       * face: it needs air as it gets smaller, not as it gets bigger. The small
       * steps used to carry negative tracking, which closed them up at exactly
       * the sizes that could least afford it. Tracking now opens as the size
       * drops, and only the poster sizes sit near zero.
       */
      fontSize: {
        'display-xl': ['clamp(2.75rem, 10.5vw, 9rem)', { lineHeight: '0.95', letterSpacing: '0.005em' }],
        'display-lg': ['clamp(2.25rem, 6.8vw, 5.5rem)', { lineHeight: '1.0', letterSpacing: '0.008em' }],
        'display-md': ['clamp(1.75rem, 4.6vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '0.012em' }],
        'display-sm': ['clamp(1.4375rem, 3.1vw, 2.25rem)', { lineHeight: '1.18', letterSpacing: '0.016em' }],
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
