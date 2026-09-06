import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // The search layer's own nuxt.config doesn't `extend` the shared layer
      // (apps wire them together via nuxt-layers-utils), so a standalone Nuxt
      // test env for this layer never generates the '#shared' alias that
      // components like ResultCard.vue and server/api/notifications rely on.
      '#shared': path.resolve(__dirname, '../shared'),
    },
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/__tests__/**/*.spec.ts'],
          exclude: ['dist/**', 'node_modules/**'],
          globals: true,
        },
      },
      await defineVitestProject({
        resolve: {
          alias: {
            '#shared': path.resolve(__dirname, '../shared'),
          },
        },
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
