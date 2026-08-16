import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/__tests__/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
