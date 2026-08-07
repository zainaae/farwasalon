import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /* Design-system kit is a standalone Babel/CDN prototype (React as global).
     Keep it out of the Next app lint gate — it is not production app code. */
  globalIgnores([
    'dist',
    '.next',
    '.next-ci',
    'node_modules',
    'coverage',
    'playwright-report',
    'test-results',
    '.tmp-design-system/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '(^[A-Z_]|^motion$|^m$)', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'react-hooks/refs': 'off',
    },
  },
])
