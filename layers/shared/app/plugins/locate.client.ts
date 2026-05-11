import { createLocate } from 'alternate-gateway/locate/createLocate'

export type SharedLocateProvider = ReturnType<typeof createLocate>

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const publicShared = (config.public as any)?.sharedNuxt ?? {}
  const locales = Array.isArray(publicShared.locales) && publicShared.locales.length > 0
    ? publicShared.locales
    : ['en']
  const defaultLocale = typeof publicShared.defaultLocale === 'string'
    ? publicShared.defaultLocale
    : (typeof locales[0] === 'string' ? locales[0] : locales[0]?.code || 'en')

  const locate = createLocate({
    locales,
    defaultLocale,
    cookieKey: typeof publicShared.locateCookieKey === 'string' ? publicShared.locateCookieKey : undefined,
    queryKey: typeof publicShared.locateQueryKey === 'string' ? publicShared.locateQueryKey : undefined,
  })

  return {
    provide: {
      locate,
    },
  }
})
