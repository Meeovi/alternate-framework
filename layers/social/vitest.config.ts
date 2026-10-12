import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Layers don't get Nuxt's generated cross-layer aliases in vitest.
    alias: {
      '#auth': fileURLToPath(new URL('../auth', import.meta.url)),
    },
  },
  test: {
    globals: true,
    include: ['test/__tests__/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
