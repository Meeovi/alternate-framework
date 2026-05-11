import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import {
  defaultAlternateLocateLocale,
  defaultAlternateLocateLocales,
} from 'alternate-locate/adapters/nuxt/i18n'

const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
    description: 'Social Layer provides functionalities for social interactions and networking.',
  },

  modules: [
    fileURLToPath(new URL('../../packages/modules/mframework-nuxt/src/module.ts', import.meta.url)),
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    ...(isProd ? ['nuxt-module-feed'] : []),
    '@mframework/nuxt'
  ],

  mframework: {
    auth: '~/auth/authImplementation',
    user: '~/auth/currentUser'
  },
  
  alias: {
    '@mframework/core': fileURLToPath(new URL('../../packages/modules/alternate-core/src', import.meta.url)),
    '#auth': fileURLToPath(new URL('../auth', import.meta.url)),
    '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
    '#social': fileURLToPath(new URL('./', import.meta.url)),
  },

  mframework: {
    gateway: '~/gateway/socialGateway',
    auth: '~/auth/socialAuth',
    user: '~/auth/currentUser',
  },

  imports: {
    dirs: [
      './app/composables',
      './app/composables/**',
    ],
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: defaultAlternateLocateLocale,
    locales: defaultAlternateLocateLocales as any,
  },

  runtimeConfig: {
    adminKey: '',
    cloudflare: {
      accountId: '',
      namespaceId: '',
      apiToken: '',
    },
      feed: {
    sources: [
      {
        path: "/feed.xml", // The route to your feed.
        type: "rss2", // Can be: rss2, atom1, json1
        cacheTime: 60 * 15, // How long should the feed be cached
      },
    ]
  },
  },

  compatibilityDate: '2026-02-16',
})