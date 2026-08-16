// Minimal real stub so Vite/vitest can resolve the '#imports' alias
// (see vitest.config.ts) before individual test files override specific
// exports via vi.doMock('#imports', ...) — Vite still needs the bare
// module specifier to resolve to something real first.
export function useRuntimeConfig(): any {
  return { public: {} }
}
