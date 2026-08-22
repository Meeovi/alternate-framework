import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Needed so runtimeConfig.public.directusUrl (read by getAssetURL, see
// test/nuxt/get-asset-url.test.ts) resolves to a real value at Nuxt boot
// instead of '' — the per-project `test.env` option isn't applied early
// enough for defineVitestProject's own Nuxt boot to see it.
process.env.DIRECTUS_URL ||= 'https://cms.test.example.com'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
          // This layer's nuxt.config registers a large number of modules —
          // booting the real Nuxt test environment for it reliably takes
          // longer than vitest's 10s default hook timeout.
          hookTimeout: 60000,
        },
      }),
    ],
  },
})
