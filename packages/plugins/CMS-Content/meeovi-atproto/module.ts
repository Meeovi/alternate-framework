import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'
import { DEFAULT_ATPROTO_SERVICE } from './runtime/client'

export interface MeeoviAtprotoModuleOptions {
  /** PDS/AppView the service account and federation reads talk to.
   *  Defaults to ATPROTO_SERVICE, else this deployment's hosted PDS. */
  service?: string
  /** Service-account credentials for server-side reads — fall back to
   *  ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD. Kept server-only. */
  identifier?: string
  appPassword?: string
  /** Register Bluesky as a network in the social layer's federation core
   *  (/api/social/federation/*). Default true. */
  federation?: boolean
}

export type { MeeoviAtprotoModuleOptions as ModuleOptions }

/**
 * @mframework/meeovi-atproto — AT Protocol (Bluesky) for M Framework.
 *
 * - `@mframework/meeovi-atproto/client`: AtprotoClient, the complete
 *   wrapper around @atproto/api (posts, feeds, follows, search, lists, …).
 * - `@mframework/meeovi-atproto/auth/plugin`: the better-auth plugin for
 *   Bluesky sign-in, sign-up and account linking.
 * - Nitro: signs in the service account (globalThis.__atprotoClient, see
 *   useAtprotoClient()) and registers the "atproto" federation network.
 */
export default defineNuxtModule<MeeoviAtprotoModuleOptions>({
  meta: {
    name: 'meeovi-atproto',
    configKey: 'meeoviAtproto',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults: {
    federation: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // `public.atproto` is serialized into the client payload — only the
    // service URL belongs there. The service-account `identifier` /
    // `appPassword` are secrets: keep them in private runtime config, and
    // strip either one an app config may already have placed under
    // `public.atproto`. runtime/server/bootstrap.ts reads them from the
    // private key (with ATPROTO_IDENTIFIER / ATPROTO_APP_PASSWORD fallback).
    const publicAtproto = { ...(nuxt.options.runtimeConfig.public as any).atproto }
    delete publicAtproto.identifier
    delete publicAtproto.appPassword
    nuxt.options.runtimeConfig.public.atproto = {
      ...publicAtproto,
      service: options.service ?? publicAtproto.service ?? process.env.ATPROTO_SERVICE ?? DEFAULT_ATPROTO_SERVICE,
    }

    const privateAtproto = { ...(nuxt.options.runtimeConfig as any).atproto }
    if (options.identifier) privateAtproto.identifier = options.identifier
    if (options.appPassword) privateAtproto.appPassword = options.appPassword
    ;(nuxt.options.runtimeConfig as any).atproto = privateAtproto

    // Nitro-only: bootstraps globalThis.__atprotoClient (a service-level
    // AtprotoClient) — see runtime/server/bootstrap.ts.
    addServerPlugin(resolver.resolve('./runtime/server/bootstrap'))
    if (options.federation !== false) addServerPlugin(resolver.resolve('./runtime/server/network'))
  },
})
