import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

// test/e2e/*.spec.ts use @nuxt/test-utils/playwright's `test`/`goto` fixtures,
// which are real Playwright Test files (not vitest tests) — they were
// previously misconfigured as a vitest "e2e" project, which can't execute
// Playwright's own test.describe()/test() registration. Run this suite with
// `npx playwright test`, not `vitest run`.
export default defineConfig({
  testDir: './test/e2e',
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
