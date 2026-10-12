/**
 * Ambient shims so the module's runtime/server sources type-check in
 * isolation. At runtime these are auto-imported globals provided by
 * Nuxt (client) / Nitro (server).
 */
export {}

declare global {
  const $fetch: typeof import('ofetch')['ofetch']
  const useRuntimeConfig: (event?: unknown) => Record<string, any>
  const useAsyncData: typeof import('nuxt/app')['useAsyncData']
  const useRequestFetch: typeof import('nuxt/app')['useRequestFetch']
  const refreshNuxtData: typeof import('nuxt/app')['refreshNuxtData']
  const defineNuxtRouteMiddleware: typeof import('nuxt/app')['defineNuxtRouteMiddleware']
  const navigateTo: typeof import('nuxt/app')['navigateTo']
}
