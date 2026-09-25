import type { RuntimeConfig } from "nuxt/schema";

export function loadEnv(runtimeConfig: RuntimeConfig) {
  return {
    url: (runtimeConfig as any).directus?.url
      || (runtimeConfig.public as any)?.directus?.url
      || process.env.DIRECTUS_GRAPHQL,
    // Server-only static token (moved from `public.directus.auth.token`).
    token: (runtimeConfig as any).directus?.token || process.env.DIRECTUS_STATIC_TOKEN
  }
}
