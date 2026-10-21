import { createVNode, render, watch } from 'vue'
import { useHead, useRuntimeConfig } from '#imports'
import CookieConsentBanner from '../components/consent/CookieConsentBanner.vue'
import { useCookieConsent } from '../composables/useCookieConsent'

/**
 * Loads analytics / advertising scripts only after consent (see
 * useCookieConsent) and mounts the banner. Each tracker loads once its
 * category is accepted and its id is configured (runtimeConfig.public.scripts,
 * NUXT_PUBLIC_SCRIPTS_*_ID). Withdrawing consent deletes their first-party
 * cookies and reloads, since a loaded third-party script can't be unloaded.
 * Ad pixels (Meta, TikTok, …) aren't loaded here — fire them from the GTM
 * container if needed.
 */

type Gtag = (...args: unknown[]) => void
type TrackerWindow = Window & { dataLayer?: unknown[], gtag?: Gtag, uetq?: unknown[] | { push: (...args: unknown[]) => void }, UET?: new (opts: Record<string, unknown>) => { push: (...args: unknown[]) => void } }

function loadScript(src: string, onload?: () => void) {
  const script = document.createElement('script')
  script.src = src
  script.async = true
  if (onload) script.onload = onload
  script.onerror = () => console.warn(`[consent] could not load ${src}`)
  document.head.appendChild(script)
}

// Each loader mirrors the vendor's standard snippet. `gtag`/`dataLayer` are
// already set up below (Consent Mode defaults go in before anything loads).
const TRACKERS: Record<'analytics' | 'ads', Record<string, (id: string, w: TrackerWindow) => void>> = {
  analytics: {
    googleTagManager: (id, w) => {
      w.dataLayer!.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`)
    },
    googleAnalytics: (id, w) => {
      w.gtag!('js', new Date())
      w.gtag!('config', id)
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)
    },
    bingUet: (id, w) => {
      w.uetq = (w.uetq as unknown[]) || []
      loadScript('https://bat.bing.com/bat.js', () => {
        if (typeof w.UET !== 'function') return
        w.uetq = new w.UET({ ti: id, enableAutoSpaTracking: true, q: w.uetq })
        w.uetq.push('pageLoad')
      })
    },
  },
  ads: {},
}

// The AdSense account's loader (was an unconditional <head> script).
const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3854548303717312'

// First-party cookies those vendors set.
const TRACKING_COOKIE = /^(_ga|_gid|_gat|_gcl|_uet|_fbp|_fbc|_ttp|_scid|_sctr|_rdt|__gads|__gpi|__gsas|_clck|_clsk|muc_ads|personalization_id)/

export default defineNuxtPlugin((nuxtApp) => {
  const { consent } = useCookieConsent()
  const ids = (useRuntimeConfig().public as { scripts?: Record<string, { id?: string } | undefined> }).scripts ?? {}

  // Google Consent Mode v2: everything denied until the visitor decides.
  const w = window as TrackerWindow
  w.dataLayer = w.dataLayer || []
  w.gtag = w.gtag || function gtag() { w.dataLayer!.push(arguments) }
  w.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500,
  })

  const loaded = new Set<string>()
  const grant = (category: keyof typeof TRACKERS) => {
    for (const [key, load] of Object.entries(TRACKERS[category])) {
      const id = ids[key]?.id
      if (loaded.has(key) || !id) continue
      loaded.add(key)
      load(id, w)
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
