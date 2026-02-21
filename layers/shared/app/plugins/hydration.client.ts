import { defineNuxtPlugin } from "nuxt/app"
import { isHydrated } from "vue"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
    isHydrated.value = true
  })
})
