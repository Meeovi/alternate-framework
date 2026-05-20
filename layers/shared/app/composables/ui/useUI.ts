import { useNuxtApp } from 'nuxt/app'

export const useUI = () => {
  const { $ui } = useNuxtApp()
  return $ui
}
