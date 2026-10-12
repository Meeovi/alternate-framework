import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'

export interface MeeoviActivitypubModuleOptions {
  /** Mastodon-API instance to read from (and post to, with a token).
   *  Defaults to ACTIVITYPUB_SERVER_URL, else https://mastodon.social. */
  server?: string
  /** Access token of the deployment's account on `server` — enables
   *  full-text post search and publishing. Defaults to
   *  ACTIVITYPUB_ACCESS_TOKEN. Kept server-only. */
  accessToken?: string
  /** Register the Fediverse as a network in the social layer's federation
   *  core (/api/social/federation/*). Default true. */
  federation?: boolean
}

export type { MeeoviActivitypubModuleOptions as ModuleOptions }

/**
 * @mframework/meeovi-activitypub — ActivityPub (Mastodon & the
 * Mastodon-API Fediverse) for M Framework, on masto.js.
 *
 * - `@mframework/meeovi-activitypub/client`: masto.js client factories.
 * - `@mframework/meeovi-activitypub/tools/*`: status, publish, timeline,
 *   notification, relationship … helpers over a masto client.
 * - `@mframework/meeovi-activitypub/protocol/*`: WebFinger and
 *   ActivityStreams helpers for servers that aren't Mastodon-API.
 * - Nitro: registers the "activitypub" federation network.
 */
export default defineNuxtModule<MeeoviActivitypubModuleOptions>({
  meta: {
    name: 'meeovi-activitypub',
    configKey: 'meeoviActivitypub',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults: {
    server: process.env.ACTIVITYPUB_SERVER_URL || 'https://mastodon.social',
    accessToken: process.env.ACTIVITYPUB_ACCESS_TOKEN || '',
    federation: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>

    // The instance URL is public; the token never leaves the server.
    runtimeConfig.public.activitypub = {
      ...(runtimeConfig.public.activitypub || {}),
      server: String(options.server || 'https://mastodon.social').replace(/\/+$/, ''),
    }
    runtimeConfig.meeoviActivitypub = {
      ...(runtimeConfig.meeoviActivitypub || {}),
      accessToken: options.accessToken || '',
    }

    if (options.federation !== false) addServerPlugin(resolver.resolve('./runtime/server/network'))
  },
})
