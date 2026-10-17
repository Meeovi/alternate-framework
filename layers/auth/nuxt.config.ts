import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'auth',
    description: 'Auth Layer provides functionalities for user authentication and authorization.',
  },

  modules: [],

  hooks: {
    // Keep Nitro's auto-imports out of alternate-sdk's compiled output. The
    // SDK is symlinked from packages/ (not under node_modules, which unimport
    // skips), and unimport's identifier scan reads `auth` in its
    // `export { authModule as auth, ... }` as a free variable — so it injected
    // `import { auth } from 'server/utils/auth'` into the SDK. That closed the
    // cycle auth.ts -> shared/utils/plugins.ts -> audits.ts -> alternate-sdk ->
    // auth.ts, and production server bundles could crash at boot with
    // "Cannot access 'plugins$1' before initialization" (better-auth's config
    // ran before its plugin list). The SDK imports '#imports' explicitly
    // wherever it needs runtime helpers, so it never needs auto-imports.
    // Appended in nitro:init, after Nitro fills in its default excludes
    // (.git, buildDir, node_modules) — it only adds those when `exclude` is
    // empty, so setting `nitro.imports.exclude` in config would drop them.
    'nitro:init'(nitro) {
      const imports = nitro.options.imports
      if (imports && Array.isArray(imports.exclude)) {
        imports.exclude.push(/[/\\]alternate-sdk[/\\]dist[/\\]/)
      }
    },
  },

  alias: {},

  runtimeConfig: {
    auth: {
      redirect: {
        login: '/login',
        home: '/'
      }
    },
    public: {
      auth: {
        backend: process.env.NUXT_PUBLIC_AUTH_BACKEND || process.env.AUTH_ADAPTER || 'better-auth',
        cookieName: 'auth-token',
        redirectUserTo: '/login',
        redirectGuestTo: '/login',
      },
      }
    }
  })