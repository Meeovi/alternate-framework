import { computed } from 'vue'

const getNuxtI18n = () => {
  try {
    const app = (globalThis as any)?.useNuxtApp?.()
    return app?.$i18n || null
  } catch {
    return null
  }
}

export const useLocate = () => {
  const i18n = getNuxtI18n()

  const locale = i18n?.locale || computed({
    get: () => 'en-US',
    set: () => {},
  })

  const locales = computed(() => {
    const value = i18n?.locales
    if (!value) return [{ code: 'en-US', name: 'English (US)', language: 'en-US', dir: 'ltr' }]
    return Array.isArray(value?.value) ? value.value : (Array.isArray(value) ? value : [])
  })

  const availableLocales = computed(() => locales.value.map((l: any) => l?.code || String(l)))

  const t = (key: string, params?: any) => {
    if (typeof i18n?.t === 'function') return i18n.t(key, params)
    return key
  }

  const setLocale = async (next: string) => {
    if (typeof i18n?.setLocale === 'function') {
      await i18n.setLocale(next)
      return
    }
    locale.value = next
  }

  return {
    t,
    locale,
    locales,
    availableLocales,
    setLocale,
  }
}
