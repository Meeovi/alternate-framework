import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const mobileMenu = ref(false)
  const modal = ref<string | null>(null)
  const loading = ref(false)

  return { mobileMenu, modal, loading }
})

