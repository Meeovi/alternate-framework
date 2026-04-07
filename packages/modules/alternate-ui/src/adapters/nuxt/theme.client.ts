import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp: any) => {
  const storageKey = 'elite-theme'
  const { $vuetify } = nuxtApp

  const initTheme = (): string => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null
    if (stored === 'light' || stored === 'dark') {
      return stored
    }

    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia('(prefers-color-scheme: dark)').matches

    return prefersDark ? 'dark' : 'light'
  }

  const theme = initTheme()
  if ($vuetify) {
    $vuetify.theme.global.name.value = theme
  }

  return {
    provide: {
      theme: {
        current: theme,
      },
    },
  }
})
