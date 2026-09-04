import { joinURL } from 'ufo'
import { defineEventHandler, proxyRequest, createError } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * Same-origin Directus proxy.
 *
 * The Directus static token is server-only (`runtimeConfig.directus.token`)
 * and is injected here, so it never reaches the browser. Client code builds
 * its `$directus` SDK client against `/api/cms` instead of talking to
 * Directus directly (see layers/commerce/app/plugins/directus.ts).
 *
 * Access rules:
 *  - system / admin endpoints (`/users`, `/roles`, `/flows`, …) are blocked
 *    outright, for everyone;
 *  - writes (POST/PATCH/DELETE) require an authenticated app session;
 *  - reads of the public CMS collections below are open;
 *  - reads of anything else require an authenticated app session.
 *
 * The allowlist is deliberately default-deny. The proper long-term fix is
 * to scope the Directus token's role to exactly the public-readable
 * collections and drop the allowlist — until then this keeps an anonymous
 * caller from reading order / customer data through the proxy.
 */

const BLOCKED_PREFIX =
  /^\/(users|roles|permissions|policies|access|flows|operations|dashboards|panels|presets|settings|extensions|schema|relations|fields|collections|server|utils|auth|activity|revisions|folders|webhooks|graphql)(\/|$|\?)/i

const PUBLIC_READ_COLLECTIONS = new Set<string>([
  'navigation', 'pages', 'page_blocks', 'blocks',
  'brands', 'shops', 'departments', 'categories', 'about_departments',
  'products', 'product_variants', 'attributes',
  'articles', 'coupons', 'incentives', 'callouts',
  'currencies', 'tags', 'websites', 'radios', 'videos', 'shorts',
])

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const directusUrl = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token

  if (!directusUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Directus is not configured' })
  }

  const rest = event.path.replace(/^\/api\/cms\/?/, '/')
  const pathOnly = rest.replace(/\?.*$/, '')

  if (BLOCKED_PREFIX.test(rest)) {
    throw createError({ statusCode: 403, statusMessage: 'This Directus path is not available through the CMS proxy' })
  }

  const method = (event.method || 'GET').toUpperCase()

  if (method !== 'GET' && method !== 'HEAD') {
    await requireAuth(event)
  } else {
    const collection = pathOnly.match(/^\/items\/([^/]+)/)?.[1]
    // Non-`/items/...` reads (e.g. `/assets/...`) and allowlisted
    // collections are open; everything else needs a session.
    if (collection && !PUBLIC_READ_COLLECTIONS.has(collection)) {
      await requireAuth(event)
    }
  }

  return proxyRequest(event, joinURL(directusUrl, rest), {
    // The proxy is the only thing that speaks for this token — replace
    // whatever the client sent.
    headers: { authorization: token ? `Bearer ${token}` : '' },
  })
})
