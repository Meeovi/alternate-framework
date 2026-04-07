import type { LocateDetection, LocateDetector } from '../types'
import { normalizeLocaleCode } from '../utils'

export const cookieDetector = (cookieKey = 'i18n_locale'): LocateDetector => {
  return (context): LocateDetection | null => {
    const value = normalizeLocaleCode(context.cookies?.[cookieKey])
    if (!value) return null
    return { locale: value, source: 'cookie' }
  }
}
