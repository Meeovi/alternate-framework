import type { LocateDetection, LocateDetector } from '../types'
import { parseAcceptLanguage, normalizeLocaleCode } from '../utils'

export const headerDetector = (): LocateDetector => {
  return (context): LocateDetection | null => {
    const candidates = parseAcceptLanguage(context.headers?.['accept-language'])
    const first = normalizeLocaleCode(candidates[0])
    if (!first) return null
    return { locale: first, source: 'header' }
  }
}
