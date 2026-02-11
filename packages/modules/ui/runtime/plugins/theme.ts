import { useTheme } from 'vuetify'

export default (nuxtApp: any) => {
  const theme = useTheme()
  // Attempt to read runtime config from nuxtApp (fallbacks to undefined)
  const config: any = (nuxtApp && (nuxtApp as any).$config && (nuxtApp as any).$config.public && (nuxtApp as any).$config.public.mframeworkUi) || {}

  // 1. Load persisted theme
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('mframework-theme') : null
  const initial = stored || config?.theme?.default || 'light'
  ;(theme as any).global.name.value = initial

  // 2. Expose a global toggle
  const toggleTheme = () => {
    const newTheme = (theme as any).global.current.value.dark ? 'light' : 'dark'
    ;(theme as any).global.name.value = newTheme
    if (typeof localStorage !== 'undefined') localStorage.setItem('mframework-theme', newTheme)
  }

  // 3. Expose to app
  nuxtApp.provide('mTheme', {
    theme,
    toggleTheme,
    setTheme: (name: string) => {
      ;(theme as any).global.name.value = name
      if (typeof localStorage !== 'undefined') localStorage.setItem('mframework-theme', name)
    }
  })
}