import { defineNuxtPlugin } from 'nuxt/app'
import FloatingVue, { install } from 'floating-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(FloatingVue)
})
