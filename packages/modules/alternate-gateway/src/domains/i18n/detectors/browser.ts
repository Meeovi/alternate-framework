import type { LocateDetection, LocateDetector } from '../types'
import { normalizeLocaleCode } from '../utils'

export const browserDetector = (): LocateDetector => {
  return (context): LocateDetection | null => {
    const first = normalizeLocaleCode(context.browserLanguages?.[0])
    if (!first) return null
    return { locale: first, source: 'browser' }
  }
}
