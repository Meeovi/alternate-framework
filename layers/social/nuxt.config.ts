import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import {
  defaultAlternateLocateLocale,
  defaultAlternateLocateLocales,
} from 'alternate-locate/adapters/nuxt/i18n'

const isProd = process.env.NODE_ENV === 'production'
const useMinimalSocialConfig = process.env.NODE_ENV === 'development' && process.env.NUXT_DEV_SOCIAL_FULL !== 'true'

const minimalSocialConfig = {
  $meta: {
    name: 'social-minimal',
    description: 'Minimal social layer config for development stability',
  },

  ignore: [
    './app/plugins/**',
    './app/middleware/**',
    './server/plugins/**',
  ],

  alias: {
    '#auth': fileURLToPath(new URL('../auth', import.meta.url)),
    '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
    '#social': fileURLToPath(new URL('./', import.meta.url)),
  },

  imports: {
    dirs: [
      './app/composables',
      './app/composables/**',
    ],
  },

  runtimeConfig: {
    adminKey: '',
    cloudflare: {
      accountId: '',
      namespaceId: '',
      apiToken: '',
    },
  },

  compatibilityDate: '2026-02-16',
}

export default defineNuxtConfig(useMinimalSocialConfig ? minimalSocialConfig : {
  $meta: {
    name: 'social',
    description: 'Social Layer provides functionalities for social interactions and networking.',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    'vuetify-nuxt-module',
    ...(isProd ? ['nuxt-module-feed'] : []),
  ],

  alias: {
    '#auth': fileURLToPath(new URL('../auth', import.meta.url)),
    '#shared': fileURLToPath(new URL('../shared', import.meta.url)),
    '#social': fileURLToPath(new URL('./', import.meta.url)),
  },

  imports: {
    dirs: [
      './app/composables',
      './app/composables/**',
    ],
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

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: defaultAlternateLocateLocale,
    locales: defaultAlternateLocateLocales,
  },

  runtimeConfig: {
    adminKey: '',
    cloudflare: {
      accountId: '',
      namespaceId: '',
      apiToken: '',
    },
  },

  compatibilityDate: '2026-02-16',
})