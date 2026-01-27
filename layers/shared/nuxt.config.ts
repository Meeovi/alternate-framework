import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
  },

  modules: [
    'nuxt-tiptap-editor',
  ],

  runtimeConfig: {}
})