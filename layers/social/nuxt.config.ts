import {
  defineNuxtConfig
} from 'nuxt/config'
import {
  currentLocales
} from '@mframework/localization'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
    description: 'Social Layer provides functionalities for social interactions and networking.',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

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