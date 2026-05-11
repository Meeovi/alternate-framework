import { createLocate } from '../../createLocate'
import { parseCookieHeader } from '../../utils'
import type { CreateLocateOptions, LocateRuntime } from '../../types'

export type NuxtLocatePluginOptions = CreateLocateOptions & {
  cookieKey?: string
  syncCookie?: boolean
}

const getRuntimeConfigLocales = (nuxtApp: any) => {
  const config = nuxtApp?.$config?.public?.i18n
  return config?.locales || []
}

const getRuntimeDefaultLocale = (nuxtApp: any) => {
  const config = nuxtApp?.$config?.public?.i18n
  return config?.defaultLocale || 'en-US'
}

export const createNuxtLocateRuntime = (nuxtApp: any, opts?: Partial<NuxtLocatePluginOptions>): LocateRuntime => {
  const locales = opts?.locales?.length ? opts.locales : getRuntimeConfigLocales(nuxtApp)
  const defaultLocale = opts?.defaultLocale || getRuntimeDefaultLocale(nuxtApp)

  return createLocate({
    locales,
    defaultLocale,
    cookieKey: opts?.cookieKey || 'i18n_locale',
    queryKey: opts?.queryKey || 'lang',
    geoToLocale: opts?.geoToLocale || {},
    customDetectors: opts?.customDetectors || [],
  })
}

export const createNuxtLocatePlugin = (opts?: Partial<NuxtLocatePluginOptions>) => {
  return async (nuxtApp: any) => {
    const isClient = typeof window !== 'undefined'
    const isServer = !isClient
    const runtime = createNuxtLocateRuntime(nuxtApp, opts)
    const route = nuxtApp?.$router?.currentRoute?.value
    const query = route?.query || {}

    const cookieHeader = isServer
      ? String(nuxtApp?.ssrContext?.event?.node?.req?.headers?.cookie || '')
      : document.cookie

    const headers = isServer
      ? nuxtApp?.ssrContext?.event?.node?.req?.headers || {}
      : { 'accept-language': navigator.language || '' }

    const browserLanguages = isClient
      ? Array.from(navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])
      : []

    const detection = runtime.detect({
      query,
      cookies: parseCookieHeader(cookieHeader),
      headers,
      browserLanguages,
    })

    const i18n = nuxtApp?.$i18n
    if (i18n?.setLocale && detection.locale && i18n.locale?.value !== detection.locale) {
      await i18n.setLocale(detection.locale)
    }

    if (opts?.syncCookie !== false && isClient && detection.locale) {
      document.cookie = `${opts?.cookieKey || 'i18n_locale'}=${encodeURIComponent(detection.locale)}; path=/; samesite=lax`
    }

    nuxtApp.provide('alternateLocate', runtime)
  }
}

export const createNuxtI18nLocaleDetector = (opts: CreateLocateOptions) => {
  const runtime = createLocate(opts)

  return (event: any, i18nConfig?: { defaultLocale?: string }) => {
    const reqUrl = String(event?.node?.req?.url || '/')
    const parsed = new URL(reqUrl, 'http://localhost')
    const query = Object.fromEntries(parsed.searchParams.entries())
    const cookieHeader = String(event?.node?.req?.headers?.cookie || '')
    const headers = event?.node?.req?.headers || {}

    const detection = runtime.detect({
      query,
      cookies: parseCookieHeader(cookieHeader),
      headers,
    })

    return detection.locale || i18nConfig?.defaultLocale || runtime.defaultLocale
  }
}
