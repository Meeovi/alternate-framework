// Which requests a locked site (runtimeConfig.siteLock.enabled) still
// answers without a session. Everything else needs a signed-in member.

/** Sign-in and sign-up pages, and the pages their emails link to. */
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/callback', '/confirm', '/2fa']

/** Build assets, fonts, translations, images and the site CSS. */
const STATIC_PREFIXES = ['/_nuxt/', '/_fonts/', '/_i18n/', '/_ipx/', '/_scripts/', '/icons/', '/images/']
const STATIC_FILES = new Set([
  '/favicon.ico', '/logo.svg', '/og-image.png', '/pwa-192x192.png', '/pwa-512x512.png',
  '/robots.txt', '/manifest.webmanifest', '/sw.js',
  '/site/custom.css', '/site/custom-css-version',
])

/**
 * Called by other servers, never by a browser. Each checks its own
 * signature or token, so it doesn't need a member's session.
 */
const MACHINE_ROUTES = [
  '/api/payment/paypal/webhooks', // PayPal
  '/api/shipment/webhook', // Shippo
  '/api/shipment/track-updated', // Shippo
  '/webhook/polar', // Polar
  '/api/social/discussions/moderate', // Rocket.Chat
]

/** better-auth: sign-in, sign-up, passkeys, magic links, OAuth and OIDC. */
const AUTH_API = '/api/auth/'

export type SiteLockAccess = 'open' | 'page' | 'api'

/**
 * 'open' when the path is reachable without a session; otherwise whether a
 * signed-out request should be sent to the login page ('page') or refused ('api').
 */
export function siteLockAccess(pathname: string): SiteLockAccess {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path.startsWith(AUTH_API) || MACHINE_ROUTES.includes(path)) return 'open'
  if (STATIC_FILES.has(path) || STATIC_PREFIXES.some((p) => path.startsWith(p))) return 'open'
  if (/^\/workbox-[\w-]+\.js$/.test(path)) return 'open'
  // A page's payload is the page's own data: open only when the page is.
  const page = path.replace(/\/_payload\.json$/, '') || '/'
  if (AUTH_PAGES.includes(page)) return 'open'
  return path.startsWith('/api/') || path.startsWith('/__') ? 'api' : 'page'
}
