export const defaultAlternateLocateLocales = [
  {
    code: 'en-US',
    language: 'en-US',
    name: 'English (US)',
    dir: 'ltr',
  },
] as const

export const defaultAlternateLocateLocale = 'en-US' as const

export const defaultAlternateLocateCookieKey = 'i18n_locale' as const
export const defaultAlternateLocateQueryKey = 'lang' as const

export const createDefaultAlternateLocateVueI18nConfig = () => ({
  legacy: false,
  locale: defaultAlternateLocateLocale,
  fallbackWarn: false,
  missingWarn: false,
})

export const defaultAlternateLocateDetectorOptions = {
  locales: defaultAlternateLocateLocales,
  defaultLocale: defaultAlternateLocateLocale,
  queryKey: defaultAlternateLocateQueryKey,
  cookieKey: defaultAlternateLocateCookieKey,
} as const
