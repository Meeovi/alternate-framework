import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir, addServerHandler } from '@nuxt/kit'
import type { MeeoviRatingsModuleOptions } from './runtime/types'

export type { MeeoviRatingsModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviRatingsModuleOptions>({
  meta: {
    name: 'meeovi-ratings',
    configKey: 'meeoviRatings',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    apiBase: '/api/ratings',
    types: ['post', 'shorts', 'product', 'list', 'station', 'space', 'outlet', 'video', 'event', 'service', 'story', 'character'],
    owners: {
      shorts: { collection: 'shorts', field: 'creator_id', label: 'Vibes' },
      post: { collection: 'posts', field: 'creator_id', label: 'Posts' },
      station: { collection: 'radios', field: 'creator_id', label: 'Radio' },
    },
    sessionEndpoint: '/api/auth/get-session',
    loginPath: '/login',
    collection: 'content_ratings',
    directus: {
      url: env.MEEOVI_RATINGS_DIRECTUS_URL || env.DIRECTUS_URL,
      token: env.MEEOVI_RATINGS_DIRECTUS_TOKEN || env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/ratings').replace(/\/+$/, '')

    // <MeeoviRating>, <MeeoviCreatorRating>, useRatings()
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })
    addImportsDir(resolver.resolve('runtime/composables'))

    addServerHandler({ route: apiBase, method: 'get', handler: resolver.resolve('server/api/batch.get') })
    addServerHandler({ route: `${apiBase}/creator/:userId`, method: 'get', handler: resolver.resolve('server/api/creator.get') })
    addServerHandler({ route: `${apiBase}/:type/:id`, method: 'put', handler: resolver.resolve('server/api/item.put') })
    addServerHandler({ route: `${apiBase}/:type/:id`, method: 'delete', handler: resolver.resolve('server/api/item.delete') })

    // Private — the Directus token never reaches the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviRatings = {
      ...(runtimeConfig.meeoviRatings as Record<string, unknown> || {}),
      collection: options.collection || 'content_ratings',
      types: (options.types || []).map((t) => t.toLowerCase()),
      owners: { ...options.owners },
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      directus: { ...options.directus },
    }
    nuxt.options.runtimeConfig.public.meeoviRatings = {
      ...(nuxt.options.runtimeConfig.public.meeoviRatings as Record<string, unknown> || {}),
      apiBase,
      loginPath: options.loginPath || '/login',
    }
  },
})
