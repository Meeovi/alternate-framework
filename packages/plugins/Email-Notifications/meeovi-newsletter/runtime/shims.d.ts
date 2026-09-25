/**
 * Ambient shims so the module's runtime/server sources type-check in
 * isolation. At runtime these are auto-imported globals provided by
 * Nuxt (client) / Nitro (server).
 */
export {}

declare global {
  const $fetch: typeof import('ofetch')['ofetch']
  const useRuntimeConfig: (event?: unknown) => Record<string, any>
}
