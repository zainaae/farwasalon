import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,jsx}', 'lib/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js', 'src/**/*.js'],
      exclude: ['**/*.test.{js,jsx}'],
      // Ratchet, not aspiration: set just under the measured baseline
      // (71.0% stmts / 60.4% branch / 57.2% funcs / 71.9% lines) so coverage
      // can only rise.
      thresholds: {
        statements: 70,
        branches: 58,
        functions: 55,
        lines: 70,
      },
    },
  },
})
