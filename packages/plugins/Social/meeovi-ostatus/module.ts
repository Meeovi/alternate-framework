import { addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface MeeoviOstatusModuleOptions {
  /** Register OStatus as a network in the social layer's federation core
   *  (/api/social/federation/ostatus/*, Settings → Accounts). Default true. */
  federation?: boolean
}

export type { MeeoviOstatusModuleOptions as ModuleOptions }

/**
 * @mframework/meeovi-ostatus — OStatus (GNU social, Friendica, postActiv…)
 * for M Framework's social layer: public profiles and posts via WebFinger
 * and Atom, and members' own accounts (connected in Settings) through
 * their server's GNU-social-compatible API.
 */
export default defineNuxtModule<MeeoviOstatusModuleOptions>({
  meta: { name: 'meeovi-ostatus', configKey: 'meeoviOstatus', compatibility: { nuxt: '^4.0.0' } },
  defaults: { federation: true },
  setup(options) {
    const resolver = createResolver(import.meta.url)
    if (options.federation !== false) addServerPlugin(resolver.resolve('./runtime/server/network'))
  },
})
