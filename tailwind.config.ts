import type { Config } from 'tailwindcss';

/**
 * Design language: Premium + Editorial + Sports + Executive.
 * Deep charcoal ground, warm-white paper, cricket-turf green accent,
 * restrained brass highlight. No neon, no heavy gradients.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08090A',
          900: '#0E1011',
          800: '#15181A',
          700: '#1E2225',
          600: '#2A2F33',
          500: '#3B4247',
          400: '#5A6369',
          tint: '#0B0F0D',
        },
        bone: {
          50: '#FCFAF6',
          100: '#F6F2EA',
          200: '#EDE7DB',
          300: '#DED6C6',
          400: '#C3B9A5',
          500: '#9C9081',
        },
        turf: {
          50: '#EDF7F1',
          100: '#D3EBDD',
          200: '#A5D6BB',
          300: '#6FBB93',
          400: '#3F9C6E',
          500: '#237F52',
          600: '#186641',
          700: '#134F33',
          800: '#0E3B27',
          900: '#0A291B',
        },
        brass: {
          50: '#FBF6E7',
          100: '#F3E7C2',
          200: '#E5D08C',
          300: '#D4B65A',
          400: '#C29B31',
          500: '#A8821F',
          600: '#866718',
          700: '#654E13',
        },
        danger: { 400: '#E4674F', 500: '#C74B33', 600: '#9E3925' },
        info: { 400: '#5B9BD5', 500: '#3B7CB8' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
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
        card: '0 1px 2px rgba(8,9,10,0.06), 0 12px 32px -18px rgba(8,9,10,0.35)',
        lift: '0 2px 4px rgba(8,9,10,0.08), 0 28px 60px -28px rgba(8,9,10,0.45)',
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
