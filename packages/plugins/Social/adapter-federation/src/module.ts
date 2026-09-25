import { defineNuxtModule, addPlugin, addServerPlugin, createResolver } from '@nuxt/kit'
import { DEFAULT_ATPROTO_SERVICE } from './clients/atproto'

// Module options TypeScript interface definition
export interface ModuleOptions {
  server?: string
  atproto?: {
    /** PDS/AppView the bundled service-account bootstrap and search
     *  provider talk to. Defaults to this deployment's hosted PDS. */
    service?: string
    /** Service-account credentials for the global read client (see
     *  runtime/server/atproto.ts) — falls back to
     *  ATPROTO_IDENTIFIER/ATPROTO_APP_PASSWORD env vars when unset. */
    identifier?: string
    appPassword?: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-activitypub',
    configKey: 'activitypub',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    server: 'https://mastodon.social',
    atproto: {
      service: DEFAULT_ATPROTO_SERVICE,
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // `public.atproto` is serialized into the client payload — only the
    // service URL belongs there. The service-account `identifier` /
    // `appPassword` are secrets: keep them in private runtime config, and
    // strip either one an app config may already have placed under
    // `public.atproto`. runtime/server/atproto.ts reads them from the
    // private key (with ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD fallback).
    const publicAtproto = { ...(nuxt.options.runtimeConfig.public as any).atproto }
    delete publicAtproto.identifier
    delete publicAtproto.appPassword
    nuxt.options.runtimeConfig.public.atproto = {
      ...publicAtproto,
      service: options.atproto?.service ?? publicAtproto.service ?? DEFAULT_ATPROTO_SERVICE,
    }

    const privateAtproto = { ...(nuxt.options.runtimeConfig as any).atproto }
    if (options.atproto?.identifier) privateAtproto.identifier = options.atproto.identifier
    if (options.atproto?.appPassword) privateAtproto.appPassword = options.atproto.appPassword
    ;(nuxt.options.runtimeConfig as any).atproto = privateAtproto

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    // Nitro-only: bootstraps globalThis.__atprotoClient (a service-level
    // AtprotoClient) — see runtime/server/atproto.ts for why this can't
    // just live in the universal plugin above.
    addServerPlugin(resolver.resolve('./runtime/server/atproto'))
  },
})
