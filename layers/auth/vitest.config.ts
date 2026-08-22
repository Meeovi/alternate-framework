import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // Matches the '#shared' alias every other layer's nuxt.config.ts
      // registers for cross-layer imports — needed here too since
      // useAlert.ts imports from '#shared/server/notifications/*'.
      '#shared': path.resolve(__dirname, '../shared'),
    },
  },
  test: {
    globals: true,
    include: ['test/__tests__/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
})
