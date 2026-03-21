// src/runtime/composables/useAuthClient.ts
import { useNuxtApp } from '#app'

export const useAdapterAuthClient = () => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$authClient
}