import type { AuthUser } from './types'

const SESSION_LOCALE_STORAGE_PREFIX = 'auth:preferred-locale:'

const getLocaleCode = (entry: string | { code?: string } | undefined) => {
  if (!entry) {
    return null
  }

  return typeof entry === 'string' ? entry : entry.code || null
}

const getUserStorageKey = (user: AuthUser) => {
  const userIdentifier = user?.id || user?.email

  if (!userIdentifier) {
    return null
  }

  return `${SESSION_LOCALE_STORAGE_PREFIX}${userIdentifier}`
}

export function useSessionLocale() {
  const i18n = (useNuxtApp() as any).$i18n
  const locale = i18n?.locale
  const locales = i18n?.locales
  const setLocale = i18n?.setLocale
  const auth = useAuth()

  const availableLocaleCodes = computed(() => {
    return locales.value
      .map((entry: unknown) => getLocaleCode(entry as string | { code?: string }))
      .filter((entry: string | null): entry is string => Boolean(entry))
  })

  const persistLocaleForUser = (user = auth.user.value, localeCode = locale.value) => {
    if (!import.meta.client) {
      return
    }

    const storageKey = getUserStorageKey(user)

    if (!storageKey || !availableLocaleCodes.value.includes(localeCode)) {
      return
    }

    window.localStorage.setItem(storageKey, localeCode)
  }

  const getPersistedLocaleForUser = (user = auth.user.value) => {
    if (!import.meta.client) {
      return null
    }

    const storageKey = getUserStorageKey(user)

    if (!storageKey) {
      return null
    }

    const storedLocale = window.localStorage.getItem(storageKey)

    return storedLocale && availableLocaleCodes.value.includes(storedLocale) ? storedLocale : null
  }

  const restoreLocaleForUser = async (user = auth.user.value) => {
    const storedLocale = getPersistedLocaleForUser(user)

    if (!storedLocale || storedLocale === locale.value) {
      return false
    }

    if (typeof setLocale === 'function') {
      await setLocale(storedLocale)
      return true
    }
    return false
  }

  const setSessionLocale = async (localeCode: string) => {
    if (!availableLocaleCodes.value.includes(localeCode)) {
      return false
    }

    if (typeof setLocale === 'function') {
      await setLocale(localeCode)
    }

    if (auth.loggedIn.value) {
      persistLocaleForUser(auth.user.value, localeCode)
    }

    return true
  }

  return {
    availableLocaleCodes,
    getPersistedLocaleForUser,
    persistLocaleForUser,
    restoreLocaleForUser,
    setSessionLocale,
  }
}