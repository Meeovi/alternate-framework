import { createVNode, render, watch } from 'vue'
import {
  useHead,
  useRuntimeConfig,
  useScriptBingUet,
  useScriptGoogleAdsense,
  useScriptGoogleAnalytics,
  useScriptGoogleTagManager,
  useScriptMetaPixel,
  useScriptRedditPixel,
  useScriptSnapchatPixel,
  useScriptTikTokPixel,
  useScriptXPixel,
} from '#imports'
import CookieConsentBanner from '../components/consent/CookieConsentBanner.vue'
import { useCookieConsent } from '../composables/useCookieConsent'

/**
 * Loads analytics / advertising scripts only after consent (see
 * useCookieConsent). They're registered in nuxt.config with
 * `trigger: 'manual'`; this plugin calls `.load()` on the ones that are
 * configured once their category is accepted, and mounts the banner.
 * Withdrawing consent deletes their first-party cookies and reloads, since
 * a loaded third-party script can't be unloaded.
 */
const CATEGORIES = {
  analytics: {
    googleTagManager: useScriptGoogleTagManager,
    googleAnalytics: useScriptGoogleAnalytics,
    bingUet: useScriptBingUet,
  },
  ads: {
    googleAdsense: useScriptGoogleAdsense,
    metaPixel: useScriptMetaPixel,
    redditPixel: useScriptRedditPixel,
    snapchatPixel: useScriptSnapchatPixel,
    tiktokPixel: useScriptTikTokPixel,
    xPixel: useScriptXPixel,
  },
} as const

// The AdSense account's loader (was an unconditional <head> script).
const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3854548303717312'

// First-party cookies those vendors set.
const TRACKING_COOKIE = /^(_ga|_gid|_gat|_gcl|_uet|_fbp|_fbc|_ttp|_scid|_sctr|_rdt|__gads|__gpi|__gsas|_clck|_clsk|muc_ads|personalization_id)/

type Gtag = (...args: unknown[]) => void

export default defineNuxtPlugin((nuxtApp) => {
  const { consent } = useCookieConsent()
  const scripts = (useRuntimeConfig().public as { scripts?: Record<string, Record<string, unknown> | undefined> }).scripts ?? {}
  // Configured = the registry entry has an id/client/etc., not just options.
  const configured = (key: string) =>
    Object.entries(scripts[key] ?? {}).some(([k, v]) => k !== 'scriptOptions' && typeof v === 'string' && v.length > 0)

  // Google Consent Mode v2: everything denied until the visitor decides.
  const w = window as unknown as { dataLayer?: unknown[], gtag?: Gtag }
  w.dataLayer = w.dataLayer || []
  w.gtag = w.gtag || function gtag() { w.dataLayer!.push(arguments) }
  w.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500,
  })

  const loaded = new Set<string>()
  const grant = (category: keyof typeof CATEGORIES) => {
    for (const [key, use] of Object.entries(CATEGORIES[category])) {
      if (loaded.has(key) || !configured(key)) continue
      loaded.add(key)
      try {
        nuxtApp.runWithContext(() => (use as () => { load: () => unknown })().load())
      } catch (error) {
        console.warn(`[consent] could not load ${key}`, error)
      }
    }
    if (category === 'ads' && !loaded.has('adsenseLoader')) {
      loaded.add('adsenseLoader')
      nuxtApp.runWithContext(() => useHead({ script: [{ src: ADSENSE_SRC, async: true, crossorigin: 'anonymous' }] }))
    }
  }

  const clearTrackingCookies = () => {
    const host = location.hostname
    const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0]!.trim())) {
      if (!TRACKING_COOKIE.test(name)) continue
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
      }
    }
  }

  nuxtApp.hook('app:mounted', () => {
    const el = document.createElement('div')
    el.id = 'cookie-consent'
    document.body.appendChild(el)
    const vnode = createVNode(CookieConsentBanner)
    vnode.appContext = nuxtApp.vueApp._context
    render(vnode, el)

    watch(consent, (now, before) => {
      w.gtag!('consent', 'update', {
        analytics_storage: now?.analytics ? 'granted' : 'denied',
        ad_storage: now?.ads ? 'granted' : 'denied',
        ad_user_data: now?.ads ? 'granted' : 'denied',
        ad_personalization: now?.ads ? 'granted' : 'denied',
      })
      if ((before?.analytics && !now?.analytics) || (before?.ads && !now?.ads)) {
        clearTrackingCookies()
        location.reload()
        return
      }
      if (now?.analytics) grant('analytics')
      if (now?.ads) grant('ads')
    }, { immediate: true })
  })
})
