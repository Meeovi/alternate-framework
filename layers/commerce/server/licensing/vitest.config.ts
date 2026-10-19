import { defineConfig } from 'vitest/config'

// Run from layers/commerce: npx vitest run --config server/licensing/vitest.config.ts
// With LICENSING_TEST_DATABASE_URL set (a throwaway Postgres with the
// licensing migration applied) the flow tests run on the Postgres
// repository and idempotency store instead of in memory.
const onDatabase = !!process.env.LICENSING_TEST_DATABASE_URL

export default defineConfig({
  test: {
    root: import.meta.dirname,
    include: ['tests/**/*.test.ts'],
    testTimeout: onDatabase ? 30_000 : 5_000,
    // Tests share one database: run files one at a time there.
    fileParallelism: !onDatabase,
  },
})
