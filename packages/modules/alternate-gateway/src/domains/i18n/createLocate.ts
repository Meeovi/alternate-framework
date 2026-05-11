import type {
  CreateLocateOptions,
  LocateContext,
  LocateDetection,
  LocateDetector,
  LocateRuntime,
} from './types'
import { toLocaleObject, pickSupportedLocale, normalizeLocaleCode } from './utils'
import { cookieDetector } from './detectors/cookie'
import { headerDetector } from './detectors/header'
import { browserDetector } from './detectors/browser'
import { geoDetector } from './detectors/geo'

const queryDetector = (queryKey: string): LocateDetector => {
  return (context) => {
    const locale = normalizeLocaleCode(context.query?.[queryKey])
    return locale ? { locale, source: 'query' } : null
  }
}

export const createLocate = (options: CreateLocateOptions): LocateRuntime => {
  const locales = options.locales.map(toLocaleObject)
  const localeCodes = locales.map((l) => l.code)

  const isSupportedLocale = (value: string | null | undefined): value is string =>
    Boolean(pickSupportedLocale(value, localeCodes))

  const resolveLocale = (value: string | null | undefined) =>
    pickSupportedLocale(value, localeCodes) || options.defaultLocale

  const detectors: LocateDetector[] = [
    queryDetector(options.queryKey || 'lang'),
    cookieDetector(options.cookieKey || 'i18n_locale'),
    headerDetector(),
    browserDetector(),
    geoDetector(options.geoToLocale || {}),
    ...(options.customDetectors || []),
  ]

  const detect = (context: LocateContext): LocateDetection => {
    for (const detector of detectors) {
      const hit = detector(context)
      if (!hit) continue
      const supported = pickSupportedLocale(hit.locale, localeCodes)
      if (supported) {
        return { locale: supported, source: hit.source }
      }
    }

    return { locale: options.defaultLocale, source: 'default' }
  }

  return {
    locales,
    localeCodes,
    defaultLocale: options.defaultLocale,
    detect,
    isSupportedLocale,
    resolveLocale,
  }
}
