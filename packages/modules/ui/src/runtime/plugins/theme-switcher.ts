import { defineNuxtPlugin } from 'nuxt/app'
import { useTheme } from 'vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const theme = useTheme()

  const setTheme = (mode: 'light' | 'dark') => {
    theme.global.name.value = mode
    document.documentElement.classList.toggle('dark', mode === 'dark')
    localStorage.setItem('mframework-theme', mode)
  }

  const toggleTheme = () => {
    const current = theme.global.name.value === 'light' ? 'dark' : 'light'
    setTheme(current)
  }

  // Load saved theme
  const saved = localStorage.getItem('mframework-theme')
  if (saved === 'light' || saved === 'dark') {
    setTheme(saved)
  }

  // Expose composable
  nuxtApp.provide('mTheme', {
    setTheme,
    toggleTheme,
    current: () => theme.global.name.value
  })
})