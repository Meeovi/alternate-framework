import { addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface MeeoviZotModuleOptions {
  /** Register Zot as a network in the social layer's federation core
   *  (/api/social/federation/zot/*, Settings → Accounts). Default true. */
  federation?: boolean
}

export type { MeeoviZotModuleOptions as ModuleOptions }

/**
 * @mframework/meeovi-zot — Zot (Hubzilla and Streams) for M Framework's
 * social layer: public channels via WebFinger and Zot discovery, and
 * members' own channels (connected in Settings) through the hub's API.
 */
export default defineNuxtModule<MeeoviZotModuleOptions>({
  meta: { name: 'meeovi-zot', configKey: 'meeoviZot', compatibility: { nuxt: '^4.0.0' } },
  defaults: { federation: true },
  setup(options) {
    const resolver = createResolver(import.meta.url)
    if (options.federation !== false) addServerPlugin(resolver.resolve('./runtime/server/network'))
  },
})
