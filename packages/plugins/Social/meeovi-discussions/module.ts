import { defineNuxtModule, createResolver, addComponentsDir, addServerHandler } from '@nuxt/kit'
import type { MeeoviDiscussionsModuleOptions } from './runtime/types'

export type { MeeoviDiscussionsModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviDiscussionsModuleOptions>({
  meta: {
    name: 'meeovi-discussions',
    configKey: 'meeoviDiscussions',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    apiBase: '/api/discussions',
    url: env.ROCKETCHAT_URL || 'https://collaborrate.com',
    types: ['post', 'note', 'product', 'outlet', 'video', 'vibe', 'space', 'station', 'list', 'bookmark', 'story', 'character', 'facet'],
    roomPrefix: 'discussion',
    sessionEndpoint: '/api/auth/get-session',
    loginPath: '/login',
    membersEndpoint: '/api/social/members',
    admin: {
      userId: env.ROCKETCHAT_ADMIN_USER_ID,
      token: env.ROCKETCHAT_ADMIN_TOKEN,
      tokenSecret: env.ROCKETCHAT_CREATE_TOKENS_SECRET,
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/discussions').replace(/\/+$/, '')
    const url = String(options.url || '').replace(/\/+$/, '')

    // <MeeoviDiscussion type="product" :id="product.id" />
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })

    // Private messages (registered before the :type/:id routes).
    addServerHandler({ route: `${apiBase}/comments`, method: 'get', handler: resolver.resolve('server/api/comments.get') })
    addServerHandler({ route: `${apiBase}/messages`, method: 'get', handler: resolver.resolve('server/api/messages.get') })
    addServerHandler({ route: `${apiBase}/messages`, method: 'post', handler: resolver.resolve('server/api/messages.post') })
    addServerHandler({ route: `${apiBase}/messages/session`, method: 'post', handler: resolver.resolve('server/api/messages-session.post') })
    addServerHandler({ route: `${apiBase}/:type/:id`, method: 'get', handler: resolver.resolve('server/api/info.get') })
    addServerHandler({ route: `${apiBase}/:type/:id/session`, method: 'post', handler: resolver.resolve('server/api/session.post') })

    // Private — the Rocket.Chat admin token never reaches the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviDiscussions = {
      ...(runtimeConfig.meeoviDiscussions as Record<string, unknown> || {}),
      types: (options.types || []).map((t) => t.toLowerCase()),
      roomPrefix: options.roomPrefix || 'discussion',
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      membersEndpoint: options.membersEndpoint || '/api/social/members',
      admin: { ...options.admin },
      // Shared secret Rocket.Chat's spam-check webhook sends (the outgoing
      // integration's token); NUXT_MEEOVI_DISCUSSIONS_MODERATION_TOKEN.
      moderationToken: env.ROCKETCHAT_MODERATION_TOKEN || '',
    }
    nuxt.options.runtimeConfig.public.meeoviDiscussions = {
      ...(nuxt.options.runtimeConfig.public.meeoviDiscussions as Record<string, unknown> || {}),
      apiBase,
      url,
      loginPath: options.loginPath || '/login',
      membersEndpoint: options.membersEndpoint || '/api/social/members',
    }
  },
})
