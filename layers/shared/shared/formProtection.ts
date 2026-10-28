/**
 * Which requests are form submissions that need a Cloudflare Turnstile
 * token — used by both sides, so they always agree:
 *
 *  - server/middleware/turnstile-forms.ts refuses them without a valid
 *    token in the `x-turnstile-token` header;
 *  - app/plugins/turnstile-forms.client.ts attaches a fresh token to them,
 *    so every form gets Turnstile without wiring it in by hand.
 *
 * Covered: anything that creates content, uploads, sends notifications,
 * takes payment or costs us an API call (shipping quotes), and the
 * workspace's edit forms. Not covered: one-click actions (ratings, hearts,
 * follows, cart quantities, dragging a card) — a challenge on every click
 * would make them unusable, and each is limited to the user's own rows.
 *
 * Auth forms are covered by better-auth's captcha plugin instead
 * (`x-captcha-response`, endpoints below).
 */

export const TURNSTILE_HEADER = 'x-turnstile-token'
export const AUTH_CAPTCHA_HEADER = 'x-captcha-response'

/**
 * better-auth endpoints behind Turnstile (layers/auth/shared/utils/plugins.ts).
 * Matched by substring, so /sign-in/email also covers /sign-in/email-otp.
 */
export const AUTH_CAPTCHA_ENDPOINTS = [
  // sign-in (password guessing)
  // better-auth matches these exactly (1.7+), so list every variant.
  '/sign-in/email', '/sign-in/email-otp', '/sign-in/username', '/sign-in/magic-link', '/sign-in/atproto',
  // accounts (spam)
  '/sign-up/email', '/sign-up/atproto',
  // only exists when an app registers @mframework/auth-anonymous
  '/sign-in/anonymous',
  // email sending (inbox bombing)
  '/request-password-reset', '/send-verification-email', '/change-email',
  '/email-otp/send-verification-otp', '/email-otp/request-password-reset', '/forget-password/email-otp',
  // account forms
  '/update-user', '/change-password', '/delete-user',
]

/** Collections whose proxy writes are one-click actions, not forms. */
const CMS_CLICK_CREATES = new Set(['reactions'])
const CMS_CLICK_EDITS = new Set(['reactions', 'list_items'])

/** Business-driver (RPC) methods that save a form. */
const BUSINESS_FORM_METHODS = new Set(['shop.update', 'payouts.request'])

type Rule = { methods: string[], path: RegExp, body?: (body: unknown) => boolean }

const RULES: Rule[] = [
  // Content created or edited through the Directus proxy (posts, spaces,
  // websites, reports, profiles, list cards…).
  { methods: ['POST'], path: /^\/api\/cms\/items\/(?<collection>[\w-]+)\/?$/ },
  { methods: ['PATCH'], path: /^\/api\/cms\/items\/(?<collection>[\w-]+)\/[^/]+\/?$/ },
  // Uploads
  { methods: ['POST'], path: /^\/api\/assets\/upload\/?$/ },
  { methods: ['POST'], path: /^\/api\/upload-video\/?$/ },
  { methods: ['POST'], path: /^\/api\/social\/spaces\/[^/]+\/media\/?$/ },
  // Lists (create / edit form)
  { methods: ['POST'], path: /^\/api\/social\/lists\/?$/ },
  { methods: ['PATCH'], path: /^\/api\/social\/lists\/[^/]+\/?$/ },
  // Notifying every follower; posting to Bluesky / the Fediverse
  { methods: ['POST'], path: /^\/api\/social\/notify-followers\/?$/ },
  { methods: ['POST'], path: /^\/api\/social\/(atproto\/post|publish)\/?$/ },
  // Calendar events (create / edit form)
  { methods: ['POST'], path: /^\/api\/social\/calendar\/events\/?$/ },
  { methods: ['PATCH'], path: /^\/api\/social\/calendar\/events\/[^/]+\/?$/ },
  // Checkout: shipping quotes (paid Shippo calls), tax quotes (the commerce
  // backend) and starting a payment
  { methods: ['POST'], path: /^\/api\/shipment\/rates\/?$/ },
  { methods: ['POST'], path: /^\/api\/payment\/paypal\/orders\/?$/ },
  { methods: ['POST'], path: /^\/api\/payment\/quote\/?$/ },
  // Newsletter sign-up
  { methods: ['POST'], path: /^\/api\/newsletter\/subscribe\/?$/ },
  // Products: dropshipping imports and supplier connections
  { methods: ['POST'], path: /^\/api\/dropshipping\/(import|connections)\/?$/ },
  { methods: ['PATCH'], path: /^\/api\/dropshipping\/connection\/?$/ },
  // Workspace: tables (create / edit rows), page builder, shop settings
  { methods: ['POST'], path: /^\/api\/tables\/collection\/?$/ },
  { methods: ['PATCH'], path: /^\/api\/tables\/item\/?$/ },
  { methods: ['POST'], path: /^\/api\/experience-pages\// },
  { methods: ['POST'], path: /^\/api\/business\/driver\/?$/, body: (b) => BUSINESS_FORM_METHODS.has(String((b as { method?: unknown })?.method ?? '')) },
  { methods: ['POST'], path: /^\/api\/workspace\/(refunds|licenses\/reissue)\/?$/ },
]

/**
 * The path as routes see it: decoded, lower-case, no repeated slashes —
 * the CMS proxy decodes and lower-cases the collection, so
 * /api/cms/items/%70osts must count as /api/cms/items/posts here.
 */
export function normalisePath(pathname: string): string {
  let path = pathname
  try { path = decodeURIComponent(path) } catch { /* keep it as sent */ }
  return path.replace(/\/{2,}/g, '/').toLowerCase()
}

/**
 * Whether this request is a form submission that needs a Turnstile token.
 * `readBody` is only called for rules that look at the body.
 */
export async function needsTurnstile(method: string, pathname: string, readBody: () => Promise<unknown> | unknown): Promise<boolean> {
  const m = method.toUpperCase()
  const path = normalisePath(pathname)
  for (const rule of RULES) {
    if (!rule.methods.includes(m)) continue
    const match = rule.path.exec(path)
    if (!match) continue
    const collection = match.groups?.collection
    if (collection && (m === 'POST' ? CMS_CLICK_CREATES : CMS_CLICK_EDITS).has(collection)) continue
    if (rule.body && !rule.body(await readBody())) continue
    return true
  }
  return false
}

/** Whether a better-auth request path is one the captcha plugin checks. */
export const needsAuthCaptcha = (method: string, pathname: string) => {
  const path = normalisePath(pathname)
  return method.toUpperCase() === 'POST' && path.startsWith('/api/auth/') && AUTH_CAPTCHA_ENDPOINTS.some((e) => path.includes(e))
}
