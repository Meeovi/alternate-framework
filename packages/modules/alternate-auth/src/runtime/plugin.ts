import { defineNuxtPlugin } from '#app'
import { useToast } from 'better-auth/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('toast', useToast())
})
