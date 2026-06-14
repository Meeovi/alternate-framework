import { useNuxtApp } from '#app'

export const useMautic = () => {
  const nuxtApp = useNuxtApp()

  if (!nuxtApp.$mautic) {
    throw new Error('adapter-mautic is not enabled or missing apiBaseUrl')
  }

  return nuxtApp.$mautic
}