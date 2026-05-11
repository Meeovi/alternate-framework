import type { LocateDetection, LocateDetector, LocaleCode } from '../types'
import { normalizeLocaleCode } from '../utils'

export const geoDetector = (geoToLocale: Record<string, LocaleCode> = {}): LocateDetector => {
  return (context): LocateDetection | null => {
    const country = String(context.geoCountry || '').trim().toUpperCase()
    if (!country) return null

    const locale = normalizeLocaleCode(geoToLocale[country])
    if (!locale) return null
    return { locale, source: 'geo' }
  }
}
