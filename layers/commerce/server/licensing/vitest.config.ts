import { defineConfig } from 'vitest/config'

// Run from layers/commerce: npx vitest run --config server/licensing/vitest.config.ts
export default defineConfig({
  test: {
    root: __dirname,
    include: ['tests/**/*.test.ts'],
  },
})
