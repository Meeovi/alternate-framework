import type { RuntimeConfig } from "nuxt/schema";

export function loadEnv(runtimeConfig: RuntimeConfig) {
  return {
    url: runtimeConfig.directus?.url || process.env.DIRECTUS_GRAPHQL,
    token: runtimeConfig.directus?.auth?.token || process.env.DIRECTUS_STATIC_TOKEN
  }
}
