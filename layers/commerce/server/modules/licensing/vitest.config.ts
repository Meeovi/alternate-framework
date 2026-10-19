import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['server/modules/licensing/tests/**/*.test.ts'],
  },
})