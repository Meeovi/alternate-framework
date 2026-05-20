import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const mobileMenu = ref(false)
  const modal = ref<string | null>(null)
  const loading = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  function toggleMobileMenu() {
    mobileMenu.value = !mobileMenu.value
  }

  function openModal(name: string) {
    modal.value = name
  }

  function closeModal() {
    modal.value = null
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function setTheme(val: 'light' | 'dark') {
    theme.value = val
  }

  return { mobileMenu, modal, loading, theme, toggleMobileMenu, openModal, closeModal, setLoading, setTheme }
})
