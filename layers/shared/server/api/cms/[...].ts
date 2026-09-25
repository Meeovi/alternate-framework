import { joinURL } from 'ufo'
import { defineEventHandler, proxyRequest, createError, readBody } from 'h3'
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

// `fields` is deliberately not in this blanket blocklist: unlike `schema`/
// `relations` (full DB schema + relation graph, admin-only), a scoped
// `GET /fields/<collection>` read is what dynamic forms (DynamicForm.vue /
// useDirectusFields) use to build their inputs for a single collection, so
// it's allowlisted per-collection below instead, the same way `/items/<collection>`
// already is.
const BLOCKED_PREFIX =
  /^\/(users|roles|permissions|policies|access|flows|operations|dashboards|panels|presets|settings|extensions|schema|relations|collections|server|utils|auth|activity|revisions|folders|webhooks|graphql)(\/|$|\?)/i

const PUBLIC_READ_COLLECTIONS = new Set<string>([
  'navigation', 'pages', 'page_blocks', 'blocks',
  'brands', 'shops', 'departments', 'categories', 'about_departments',
  'products', 'product_variants', 'attributes',
  'articles', 'coupons', 'incentives', 'callouts',
  'currencies', 'tags', 'websites', 'radios', 'videos', 'shorts',
])

// Ownership columns the proxy fills from the app session. Clients can't be
// trusted to say who created something (it would let anyone post "as"
// another user and show their avatar), so on create the value is always
// overwritten with the signed-in user's id, and on update it's stripped.
const OWNER_FIELDS: Record<string, string> = {
  shorts: 'creator_id',
}

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

  let body: string | undefined
  if (method !== 'GET' && method !== 'HEAD') {
    const user = await requireAuth(event)
    const ownerField = OWNER_FIELDS[pathOnly.match(/^\/items\/([^/]+)/)?.[1] || '']
    if (ownerField && (method === 'POST' || method === 'PATCH')) {
      const payload = await readBody(event)
      const stamp = (item: Record<string, unknown>) => {
        if (!item || typeof item !== 'object') return item
        const next = { ...item }
        if (method === 'POST') next[ownerField] = user.id
        else delete next[ownerField]
        return next
      }
      body = JSON.stringify(Array.isArray(payload) ? payload.map(stamp) : stamp(payload))
    }
  } else {
    const itemsCollection = pathOnly.match(/^\/items\/([^/]+)/)?.[1]
    const fieldsCollection = pathOnly.match(/^\/fields\/([^/]+)$/)?.[1]
    // Non-`/items/...`/`/fields/...` reads (e.g. `/assets/...`) and
    // allowlisted collections are open; the whole-schema `/fields` listing
    // (no collection) and everything else needs a session.
    if (
      pathOnly === '/fields' ||
      (itemsCollection && !PUBLIC_READ_COLLECTIONS.has(itemsCollection)) ||
      (fieldsCollection && !PUBLIC_READ_COLLECTIONS.has(fieldsCollection))
    ) {
      await requireAuth(event)
    }
  }

  return proxyRequest(event, joinURL(directusUrl, rest), {
    // The proxy is the only thing that speaks for this token — replace
    // whatever the client sent.
    headers: {
      authorization: token ? `Bearer ${token}` : '',
      // h3 forwards the client's original content-length, which no longer
      // matches once the body has been rewritten.
      ...(body !== undefined ? { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(body)) } : {}),
    },
    // proxyRequest forwards the original request body unless fetchOptions
    // supplies one (a top-level `body` is ignored).
    ...(body !== undefined ? { fetchOptions: { body, duplex: undefined } } : {}),
  })
})
