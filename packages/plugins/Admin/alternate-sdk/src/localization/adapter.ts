import type { LocalizationAdapter, LocalizationState, LocaleDefinition, LocationInfo } from './types.js'

type AnyRecord = Record<string, any>

function resolveGatewayLocalization(): AnyRecord {
  const runtime = globalThis as AnyRecord
  const gatewayFactory = runtime.useGateway

  if (typeof gatewayFactory !== 'function') {
    return {}
  }

  try {
    const gateway = gatewayFactory() as AnyRecord
    return (gateway?.localization as AnyRecord) || {}
  } catch {
    return {}
  }
}

function resolveRuntimeConfig(): AnyRecord {
  const runtime = globalThis as AnyRecord
  const configFactory = runtime.useRuntimeConfig

  if (typeof configFactory !== 'function') {
    return {}
  }

  try {
    return (configFactory() as AnyRecord) || {}
  } catch {
    return {}
  }
}

function resolveRequestHeaders(): Record<string, string> {
  const runtime = globalThis as AnyRecord
  const headersFactory = runtime.useRequestHeaders

  if (typeof headersFactory !== 'function') {
    return {}
  }

  try {
    return (headersFactory() as Record<string, string>) || {}
  } catch {
    return {}
  }
}

function normalizeLocaleDefinition(input: AnyRecord): LocaleDefinition {
  return {
    code: String(input.code || input.locale || 'en'),
    iso: input.iso ? String(input.iso) : undefined,
    name: input.name ? String(input.name) : undefined,
    label: input.label ? String(input.label) : undefined,
    region: input.region ? String(input.region) : undefined,
    currency: input.currency ? String(input.currency) : undefined,
    rtl: Boolean(input.rtl),
    default: Boolean(input.default),
  }
}

function parseAcceptLanguage(value: string | undefined): string[] {
  return String(value || '')
    .split(',')
    .map((segment) => segment.split(';')[0]?.trim())
    .filter((segment): segment is string => Boolean(segment))
}

function pickLocale(locales: LocaleDefinition[], candidates: string[]): string {
  const localeCodes = locales.map((locale) => locale.code)

  for (const candidate of candidates) {
    if (localeCodes.includes(candidate)) return candidate

    const baseCandidate = candidate.split('-')[0]
    if (baseCandidate && localeCodes.includes(baseCandidate)) return baseCandidate
  }

  return locales.find((locale) => locale.default)?.code || locales[0]?.code || 'en'
}

function inferLocationFromHeaders(headers: Record<string, string>): LocationInfo | null {
  const countryCode =
    headers['x-vercel-ip-country']
    || headers['cf-ipcountry']
    || headers['cloudfront-viewer-country']
    || headers['x-country-code']

  const region = headers['x-vercel-ip-country-region'] || headers['x-region']
  const city = headers['x-vercel-ip-city'] || headers['x-city']
  const timezone = headers['x-vercel-ip-timezone'] || headers['x-timezone']

  if (!countryCode && !region && !city && !timezone) {
    return null
  }

  return {
    countryCode,
    region,
    city,
    timezone,
  }
}

function inferClientLocale(): string | null {
  const runtime = globalThis as AnyRecord
  const navigatorValue = runtime.navigator as { language?: string } | undefined
  return navigatorValue?.language || null
}

function inferTimezone(location: LocationInfo | null): string | undefined {
  if (location?.timezone) return location.timezone

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

export function useLocalizationAdapter(): LocalizationAdapter {
  const localization = resolveGatewayLocalization()

  const getLocales = async (args: AnyRecord = {}): Promise<LocaleDefinition[]> => {
    const fn = localization?.getLocales ?? localization?.listLocales ?? localization?.locales
    if (typeof fn === 'function') {
      const result = await fn(args)
      if (Array.isArray(result)) return result.map((locale) => normalizeLocaleDefinition(locale || {}))
    }

    const runtimeConfig = resolveRuntimeConfig()
    const configuredLocales = runtimeConfig?.public?.i18n?.locales
    if (Array.isArray(configuredLocales)) {
      return configuredLocales.map((locale: AnyRecord) => normalizeLocaleDefinition(locale || {}))
    }

    return [{ code: 'en', iso: 'en-US', default: true }]
  }

  const detectLocation = async (args: AnyRecord = {}): Promise<LocationInfo | null> => {
    const fn = localization?.detectLocation ?? localization?.getLocation
    if (typeof fn === 'function') {
      const result = await fn(args)
      return result && typeof result === 'object' ? (result as LocationInfo) : null
    }

    const headers = Object.keys(args.headers || {}).length ? args.headers : resolveRequestHeaders()
    return inferLocationFromHeaders(headers)
  }

  const getCurrentLocale = async (args: AnyRecord = {}): Promise<string> => {
    const fn = localization?.getCurrentLocale ?? localization?.detectLocale ?? localization?.getLocale
    if (typeof fn === 'function') {
      const result = await fn(args)
      if (result) return String(result)
    }

    const locales = await getLocales(args)
    const headers = Object.keys(args.headers || {}).length ? args.headers : resolveRequestHeaders()
    const candidates = [
      ...parseAcceptLanguage(headers['accept-language']),
      ...(inferClientLocale() ? [inferClientLocale() as string] : []),
    ]

    return pickLocale(locales, candidates)
  }

  const resolveLocalization = async (args: AnyRecord = {}): Promise<LocalizationState> => {
    const fn = localization?.resolveLocalization ?? localization?.getLocalization
    if (typeof fn === 'function') {
      const result = await fn(args)
      if (result && typeof result === 'object') {
        const normalizedLocales = Array.isArray((result as AnyRecord).locales)
          ? (result as AnyRecord).locales.map((locale: AnyRecord) => normalizeLocaleDefinition(locale || {}))
          : await getLocales(args)

        return {
          locale: String((result as AnyRecord).locale || pickLocale(normalizedLocales, [])),
          locales: normalizedLocales,
          location: ((result as AnyRecord).location as LocationInfo | null | undefined) || null,
          timezone: (result as AnyRecord).timezone ? String((result as AnyRecord).timezone) : undefined,
          currency: (result as AnyRecord).currency ? String((result as AnyRecord).currency) : undefined,
          source: (result as AnyRecord).source ? String((result as AnyRecord).source) : 'backend',
        }
      }
    }

    const locales = await getLocales(args)
    const location = await detectLocation(args)
    const locale = await getCurrentLocale(args)
    const selectedLocale = locales.find((entry) => entry.code === locale)

    return {
      locale,
      locales,
      location,
      timezone: inferTimezone(location),
      currency: selectedLocale?.currency,
      source: location ? 'headers' : 'runtime',
    }
  }

  return {
    getLocales,
    detectLocation,
    getCurrentLocale,
    resolveLocalization,
  }
}

export default useLocalizationAdapter