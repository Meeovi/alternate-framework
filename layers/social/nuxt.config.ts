import {
  defineNuxtConfig
} from 'nuxt/config'
import {
  currentLocales
} from '@mframework/localization'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  features: {
    inlineStyles: false,
  },
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    // Temporary workaround to avoid hash mismatch issue
    // ref. https://github.com/elk-zone/elk/issues/3385#issuecomment-3335167005
    entryImportMap: false,
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