import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Prefer TS sources when both .ts and generated .js exist in src.
    extensions: ['.ts', '.mts', '.tsx', '.js', '.mjs', '.jsx', '.json'],
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.test.js', 'dist/**', 'node_modules/**'],
    environment: 'node',
  },
})
