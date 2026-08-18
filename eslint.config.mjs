import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** Flat config. eslint-config-next 16 ships native flat presets, so no compat layer. */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
