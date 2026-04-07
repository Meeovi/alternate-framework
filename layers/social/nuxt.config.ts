import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import {
  defaultAlternateLocateLocale,
  defaultAlternateLocateLocales,
} from 'alternate-locate/adapters/nuxt/i18n'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
    description: 'Social Layer provides functionalities for social interactions and networking.',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  alias: {
    '#social': fileURLToPath(new URL('./', import.meta.url)),
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