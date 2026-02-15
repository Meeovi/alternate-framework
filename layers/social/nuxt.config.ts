import {
  defineNuxtConfig
} from 'nuxt/config'
import { resolve } from 'pathe'

export default defineNuxtConfig({
  $meta: {
    name: 'social',
  },

  runtimeConfig: {},

  // Temporarily disable PWA generation during build to avoid plugin resolution
  // issues while producing the production bundle. Remove or set to `false` to
  // re-enable PWA once plugin resolution is configured.
  pwa: {
    disable: true,
  },
})