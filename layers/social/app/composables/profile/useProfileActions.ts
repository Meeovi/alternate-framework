import { computed } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from '#auth/app/composables/useAuth'
import { useTheme } from 'vuetify'

/**
 * Header actions for `/u/` — light/dark toggle and sign-out.
 */
export function useProfileActions() {
  const theme = useTheme()
  const THEME_STORAGE_KEY = 'elite-theme'

  const isDark = computed(() => theme.global.name.value === 'dark')

  const toggleTheme = () => {
    const next = isDark.value ? 'light' : 'dark'
    theme.change(next)
    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    }
  }

  const signOut = async () => {
    await (useAuth() as any).signOut()
    await navigateTo('/login')
  }

  return { isDark, toggleTheme, signOut }
}
