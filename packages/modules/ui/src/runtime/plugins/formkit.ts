import { defineNuxtPlugin } from 'nuxt/app'
import { plugin as formKitPlugin, defaultConfig } from '@formkit/vue'
import '@formkit/themes/genesis'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(formKitPlugin, defaultConfig({
    // You can inject your own inputs, locales, etc. here
  }))
})