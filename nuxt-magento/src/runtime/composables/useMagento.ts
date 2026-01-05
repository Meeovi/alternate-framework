import { useNuxtApp } from "#imports"

export const useMagento = () => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$magento
}
