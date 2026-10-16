import { computed } from 'vue'
import { useCookie, useState } from '#imports'

/**
 * Cookie consent (UK/EU PECR + GDPR): nothing non-essential — analytics,
 * advertising, tracking pixels — loads until the visitor opts in. The
 * choice lives in a first-party cookie for 6 months; plugins/cookie-consent
 * loads the matching @nuxt/scripts entries (registered with
 * `trigger: 'manual'` in nuxt.config) once it's given.
 *
 * Bump CONSENT_VERSION when the categories or vendors change materially, so
 * everyone is asked again.
 */
export const CONSENT_VERSION = 1

export interface CookieConsent {
  v: number
  analytics: boolean
  ads: boolean
  at: string
}

export function useCookieConsent() {
  const cookie = useCookie<CookieConsent | null>('meeovi_consent', {
    maxAge: 60 * 60 * 24 * 182,
    sameSite: 'lax',
    secure: true,
    default: () => null,
  })
  // One shared copy for the banner and the loader plugin (separate
  // useCookie refs don't reliably stay in sync with each other).
  const state = useState<CookieConsent | null>('cookie-consent', () => cookie.value ?? null)
  const settingsOpen = useState('cookie-consent-settings', () => false)

  const consent = computed(() => (state.value?.v === CONSENT_VERSION ? state.value : null))
  const decided = computed(() => Boolean(consent.value))

  const save = (choice: { analytics: boolean, ads: boolean }) => {
    state.value = { v: CONSENT_VERSION, analytics: choice.analytics, ads: choice.ads, at: new Date().toISOString() }
    cookie.value = state.value
    settingsOpen.value = false
  }

  return {
    consent,
    decided,
    settingsOpen,
    acceptAll: () => save({ analytics: true, ads: true }),
    rejectAll: () => save({ analytics: false, ads: false }),
    save,
    openSettings: () => { settingsOpen.value = true },
  }
}
