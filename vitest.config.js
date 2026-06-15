import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,jsx}', 'lib/**/*.test.{js,jsx}'],
  },
})
