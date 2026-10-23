import { joinURL } from 'ufo'
import qs from 'qs'
import { defineEventHandler, proxyRequest, createError, readBody, getHeader, setResponseHeader } from 'h3'
import { getAuthSession, requireAuth } from '#auth/server/utils/sessions'
import { checkReadQuery, checkWritePayload, loadRelationGraph, type GuardRules } from '../../utils/cmsQueryGuard'
import { PRIVATE_CONTENT_COLLECTIONS, mergeDeep, privateContentFilter, privateRelationDeep } from '../../utils/privateContent'
import { checkSpam, contentText } from '../../utils/spam'

/**
 * Same-origin Directus proxy.
 *
 * The Directus static token is server-only (`runtimeConfig.directus.token`)
 * and is injected here, so it never reaches the browser. Client code builds
 * its `$directus` SDK client against `/api/cms` instead of talking to
 * Directus directly (see layers/commerce/app/plugins/directus.ts).
 *
 * Access rules:
 *  - only `/items`, `/fields`, `/files` and `/assets` are proxied; system /
 *    admin endpoints (`/users`, `/roles`, `/flows`, …) are blocked for everyone;
 *  - writes (POST/PATCH/DELETE) require an authenticated app session;
 *  - reads of the public CMS collections below are open;
 *  - reads of anything else require an authenticated app session;
 *  - orders / invoices / transactions are filtered to the caller's own rows;
 *  - private content (private lists, draft/private posts, private spaces…,
 *    see privateContent.ts) is only returned to its owner;
 *  - every relation a query or payload follows is checked (cmsQueryGuard.ts),
 *    so a protected table can't be reached through a readable one.
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

// The only Directus endpoints the app's SDK client uses.
const PROXIED_PREFIX = /^\/(items|fields|files|assets)(\/|$)/

// The commerce extension's public routes (see its src/routes/catalog.ts).
const SEGMENT = '[A-Za-z0-9_~=+-]+(?:%[0-9A-Fa-f]{2}[A-Za-z0-9_~=+-]*)*'
const PUBLIC_COMMERCE: [string, RegExp][] = [
  ['GET', new RegExp(`^/commerce/(products|categories|search|search/suggest|store|gift-cards/products|sellers|reviews/ratings)$`)],
  ['GET', new RegExp(`^/commerce/products/${SEGMENT}(/reviews)?$`)],
  ['GET', new RegExp(`^/commerce/categories/${SEGMENT}$`)],
  ['POST', /^\/commerce\/realtime\/stock$/],
]

// SEARCH (query-in-body) and anything exotic would skip the query checks.
const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PATCH', 'DELETE'])

const PUBLIC_READ_COLLECTIONS = new Set<string>([
  'navigation', 'pages', 'page_blocks', 'blocks',
  'brands', 'shops', 'departments', 'categories', 'about_departments',
  'products', 'product_variants', 'attributes',
  'articles', 'coupons', 'incentives', 'callouts',
  'currencies', 'tags', 'websites', 'radios', 'videos', 'shorts',
  // public job listings (/careers)
  'careers',
])

// The only collections a non-admin may write through this proxy (the proxy
// writes with the static token, so anything else — navigation, pages,
// products, lists… — is admin-only here; admins also edit in Directus or
// via <MeeoviTable>, which has its own /api/tables rules).
//
// `owner` is the column holding the app user's id. Clients can't be trusted
// to say who created something (it would let anyone post "as" another user),
// so on create it's always overwritten with the signed-in user's id, on
// update it's stripped, and only that user (or an admin) may PATCH/DELETE.
// `createOnly` collections have no owner column: users may add rows, never
// change or delete them.
//
// `parentList` collections belong to whoever owns the list in `list_id`.
//
// `lists` themselves aren't here: they're created / changed through
// /api/social/lists (ownership lives in the lists_directus_users junction).
const USER_WRITABLE: Record<string, { owner?: string; createOnly?: boolean; parentList?: string }> = {
  posts: { owner: 'creator_id' },
  shorts: { owner: 'creator_id' },
  radios: { owner: 'creator_id' },
  // A profile's primary key IS its user's id (profiles.id → users.id).
  profiles: { owner: 'id' },
  reactions: { owner: 'user_id' },
  media_folders: { owner: 'user' },
  spaces: { owner: 'owner' },
  websites: { owner: 'creator' },
  report: { createOnly: true },
  // Kanban / task list / habit tracker cards.
  list_items: { parentList: 'list_id' },
}

// User-written collections checked for spam on write, and the fields that
// aren't prose (links, ids, slugs, status…) left out of the check.
const SPAM_CHECKED = new Set(['posts', 'shorts', 'radios', 'profiles', 'spaces', 'websites', 'report', 'list_items'])
const NOT_PROSE = /(^|_)(id|ids|url|urls|slug|status|type|image|file|video|audio|thumbnail|date|time|at)$|^(url|link|href)$/i

// Tables in the same Postgres database that Directus also exposes as
// collections, but which belong to better-auth / OAuth / billing internals:
// session tokens, password hashes, 2FA secrets, API keys, OAuth client
// secrets, JWKS private keys... Through this proxy (static token) any
// signed-in user could read AND write them — e.g. set their own auth_role
// to admin. Never reachable here, for anyone — not even through a relation.
// Also per-user server-only collections: dropshipping credentials, and
// integration installs (each user's installs and plugin data, served only
// by the integrations API, scoped to the session user).
const AUTH_TABLES = /^(sessions|users|accounts|verification|two_factor|apikey|api_keys|passkeys?|rate_limit|atproto_sessions|oauth_[a-z_]*|jwks|audit_log_entries|device_code|member|invitation|organization[a-z_]*|team[a-z_]*|sso_provider|scim_provider|dropship_[a-z_]*|integration_installs)$/i

// Directus' own tables (its admin users, roles, settings…), apart from the
// file library the app uploads to.
const SYSTEM_TABLES = /^directus_(?!files$|folders$)/i

// Personal / billing data the app never reads from the browser: admins only.
// `customers` is the Mage-OS store's customers, mirrored into Directus.
const PRIVATE_COLLECTIONS = /^(address|addresses|customers|os_[a-z_]+|subscriptions[a-z_]*|help_feedback)$/i

// Customer billing records. The app reads them client-side (order /
// invoice / transaction pages), so instead of being admin-only, a
// non-admin's read is always narrowed to their own rows here — whatever
// filter the client sent. Only server routes (checkout fulfilment, Shippo) write
// them, so non-admin writes are refused.
const OWNER_SCOPED: Record<string, (userId: string) => Record<string, unknown>> = {
  // orders.user_id is a Directus-users relation; the better-auth buyer is buyer_id.
  orders: (id) => ({ buyer_id: { _eq: id } }),
  invoices: (id) => ({ user: { _eq: id } }),
  transactions: (id) => ({ order: { buyer_id: { _eq: id } } }),
}
// An owner-scoped read may follow its own billing relations.
const OWNER_SCOPED_REACHABLE = /^(orders|invoices|transactions|address|addresses)$/i

// better-auth roles are comma-separated ("user,admin"), so check membership.
const isAdmin = (user: { role?: string | null } | null | undefined) =>
  !!user && (user.role || '').split(',').map((r) => r.trim()).includes('admin')

const own = <T>(map: Record<string, T>, key: string): T | undefined =>
  Object.hasOwn(map, key) ? map[key] : undefined

const denied = () => createError({ statusCode: 403, statusMessage: 'This Directus path is not available through the CMS proxy' })

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const directusUrl = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token

  if (!directusUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Directus is not configured' })
  }

  let rest = event.path.replace(/^\/api\/cms\/?/, '/')
  const pathOnly = rest.replace(/\?.*$/, '')
  const search = rest.slice(pathOnly.length + 1)

  // Dot segments / encoded separators could make Directus resolve a
  // different path than the one checked here.
  if (/(^|\/)\.{1,2}(\/|$)|%2e|%2f|%5c|\\/i.test(pathOnly)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid CMS path' })
  }
  const method = (event.method || 'GET').toUpperCase()

  // The store's public catalogue (directus-extension-mageos-commerce), for
  // the browser's CommerceBackendRegistry 'magento' adapter. Forwarded
  // WITHOUT the static token: Directus trusts that token with customers,
  // orders and refunds on /commerce/*, so the browser only ever reaches
  // these routes anonymously.
  if (PUBLIC_COMMERCE.some(([m, path]) => m === method && path.test(pathOnly))) {
    return proxyRequest(event, joinURL(directusUrl, rest), {
      headers: { authorization: '', cookie: '' },
      onResponse: (ev: typeof event, response: Response) => {
        for (const name of [...response.headers.keys()]) {
          if (name.startsWith('access-control-')) ev.node.res.removeHeader(name)
        }
      },
    })
  }

  if (BLOCKED_PREFIX.test(rest) || !PROXIED_PREFIX.test(pathOnly)) throw denied()

  if (!ALLOWED_METHODS.has(method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
  const isRead = method === 'GET' || method === 'HEAD'

  const [, itemsCollection, itemId] = pathOnly.match(/^\/items\/([^/]+)(?:\/([^/]+))?/) || []
  const collection = decodeURIComponent(itemsCollection || '').toLowerCase()
  const fieldsCollection = pathOnly.match(/^\/fields\/([^/]+)$/)?.[1]
  // `/files` is the directus_files collection (relations: uploaded_by → directus_users…).
  const queryCollection = collection || (/^\/files(\/|$)/.test(pathOnly) ? 'directus_files' : '')

  const protectedTable = (c: string) => AUTH_TABLES.test(c) || SYSTEM_TABLES.test(c)
  if ((collection && protectedTable(collection)) || (fieldsCollection && protectedTable(fieldsCollection))) throw denied()

  // Who is asking. Writes, private collections and non-public reads need a
  // session; public reads only look one up when a cookie is present.
  const needsSession = !isRead
    || PRIVATE_COLLECTIONS.test(collection)
    || !!own(OWNER_SCOPED, collection)
    || pathOnly === '/fields'
    || /^\/files(\/|$)/.test(pathOnly)
    // Content that can be private is filtered per viewer instead: signed
    // out, only its public rows.
    || (!!collection && !PUBLIC_READ_COLLECTIONS.has(collection) && !(isRead && PRIVATE_CONTENT_COLLECTIONS.has(collection)))
    || (!!fieldsCollection && !PUBLIC_READ_COLLECTIONS.has(fieldsCollection))
  const user = needsSession
    ? await requireAuth(event)
    : getHeader(event, 'cookie') ? (await getAuthSession(event).catch(() => null))?.user ?? null : null
  const admin = isAdmin(user)

  if (PRIVATE_COLLECTIONS.test(collection) && !admin) throw denied()

  const scope = !admin && user ? own(OWNER_SCOPED, collection) : undefined
  const rules: GuardRules = {
    allowNestedWrites: admin,
    canReach: (c) => {
      if (protectedTable(c)) return false
      if (admin) return true
      // From your own order/invoice/transaction: its billing relations.
      if (scope) return !PRIVATE_COLLECTIONS.test(c) || OWNER_SCOPED_REACHABLE.test(c)
      return !PRIVATE_COLLECTIONS.test(c) && !own(OWNER_SCOPED, c.toLowerCase())
    },
  }

  // Ownership of a list lives in the lists_directus_users junction (user_id = app user id).
  const userOwnsList = async (listId: unknown) => {
    if (listId === null || listId === undefined || listId === '' || typeof listId === 'object') return false
    const found = await $fetch<{ data?: unknown[] }>(joinURL(directusUrl, 'items', 'lists'), {
      headers: { authorization: token ? `Bearer ${token}` : '' },
      query: { fields: 'id', limit: 1, filter: JSON.stringify({ _and: [{ id: { _eq: listId } }, { user: { user_id: { _eq: user!.id } } }] }) },
    }).catch(() => null)
    return !!found?.data?.length
  }

  // Directus parses query strings with qs (bracket syntax included) — parse
  // the same way so the checks see what Directus will see.
  const query = qs.parse(search, { depth: 20, arrayLimit: 1000, parameterLimit: 2000 }) as Record<string, unknown>
  let queryChanged = false
  if (queryCollection) {
    const graph = await loadRelationGraph(directusUrl, token).catch(() => {
      throw createError({ statusCode: 503, statusMessage: 'CMS is unavailable' })
    })
    checkReadQuery(graph, rules, queryCollection, query)
    if (!isRead && getHeader(event, 'content-type')?.includes('application/json')) {
      checkWritePayload(graph, rules, queryCollection, await readBody(event))
    }
    // Private rows nested through relations (a public space's private lists…).
    if (isRead && !admin && query.fields !== undefined) {
      const ours = privateRelationDeep(graph, queryCollection, query.fields, user?.id ? String(user.id) : null)
      if (Object.keys(ours).length) {
        const clientDeep = typeof query.deep === 'string' ? JSON.parse(query.deep) : query.deep
        query.deep = JSON.stringify(mergeDeep(clientDeep, ours))
        queryChanged = true
      }
    }
  }

  if (scope && !isRead) throw createError({ statusCode: 403, statusMessage: 'Billing records are read-only here' })

  // Rows this viewer may read: their own billing records, or — for content
  // that can be private (lists, posts, spaces…) — public rows plus their own
  // private ones (privateContent.ts). Admins read everything.
  const rowFilter = scope
    ? scope(user!.id)
    : !admin && isRead && collection ? privateContentFilter(collection, user?.id ? String(user.id) : null) : undefined

  if (rowFilter && isRead) {
    // AND the row filter onto whatever the client asked for.
    const ownRows = rowFilter
    const clientFilter = typeof query.filter === 'string' ? JSON.parse(query.filter) : query.filter
    const filters = [ownRows, ...(clientFilter ? [clientFilter] : [])]
    if (itemId) {
      // Directus ignores `filter` on a single-item read (/items/x/<id>), so
      // look the item up as a filtered list instead.
      const id = decodeURIComponent(itemId)
      if (id.includes(',')) throw createError({ statusCode: 400, statusMessage: 'One item at a time' })
      const listQuery = { ...query, filter: JSON.stringify({ _and: [...filters, { id: { _eq: id } }] }), limit: 1 }
      const found = await $fetch<{ data?: unknown[] }>(
        `${joinURL(directusUrl, 'items', collection)}?${qs.stringify(listQuery, { encodeValuesOnly: true, arrayFormat: 'brackets' })}`,
        { headers: { authorization: token ? `Bearer ${token}` : '' } },
      )
      // Same answer Directus gives for a missing item, so ids can't be probed.
      if (!found.data?.length) throw createError({ statusCode: 403, statusMessage: "You don't have permission to access this." })
      return { data: found.data[0] }
    }
    const scoped = { ...query, filter: JSON.stringify(filters.length > 1 ? { _and: filters } : ownRows) }
    rest = `${pathOnly}?${qs.stringify(scoped, { encodeValuesOnly: true, arrayFormat: 'brackets' })}`
  } else if (queryChanged) {
    rest = `${pathOnly}?${qs.stringify(query, { encodeValuesOnly: true, arrayFormat: 'brackets' })}`
  }

  let body: string | undefined
  if (!isRead) {
    const policy = own(USER_WRITABLE, collection)
    const ownerField = policy?.owner

    if (!admin) {
      // Includes /files: user uploads go to Pixanomy (/api/assets/upload),
      // which checks file contents — Directus would store whatever type the
      // browser claimed and serve it from this origin.
      if (!policy) {
        throw createError({ statusCode: 403, statusMessage: 'Only an admin can change this content' })
      }
      if (policy?.createOnly && method !== 'POST') {
        throw createError({ statusCode: 403, statusMessage: 'This content cannot be changed once sent' })
      }
    }

    // List items: the list (and, on PATCH, any list it's moved to) must be the caller's.
    const parentField = policy?.parentList
    if (parentField && !admin) {
      if (method !== 'POST' && !itemId) {
        throw createError({ statusCode: 403, statusMessage: 'Only an admin can change several items at once' })
      }
      const listIds = new Set<unknown>()
      if (itemId) {
        const existing = await $fetch<{ data?: Record<string, unknown> }>(
          joinURL(directusUrl, 'items', collection, itemId),
          { headers: { authorization: token ? `Bearer ${token}` : '' }, query: { fields: parentField } },
        ).catch(() => null)
        listIds.add(existing?.data?.[parentField] ?? null)
      }
      if (method !== 'DELETE') {
        const payload = await readBody(event)
        for (const item of Array.isArray(payload) ? payload : [payload]) {
          if (method === 'POST' || (item && typeof item === 'object' && parentField in item)) listIds.add(item?.[parentField] ?? null)
        }
      }
      for (const listId of listIds) {
        if (!(await userOwnsList(listId))) {
          throw createError({ statusCode: 403, statusMessage: 'You can only change your own lists' })
        }
      }
    }

    // Only an item's owner (or an admin) may change or delete it — hiding the
    // edit menu in the UI isn't enough, the proxy's token can write anything.
    // Batch PATCH/DELETE on /items/<collection> (no id) is admin-only, since
    // it can target any rows.
    if (ownerField && (method === 'PATCH' || method === 'DELETE') && !admin) {
      if (!itemId) {
        throw createError({ statusCode: 403, statusMessage: 'Only an admin can change several items at once' })
      }
      const existing = await $fetch<{ data?: Record<string, unknown> }>(
        joinURL(directusUrl, 'items', collection, itemId),
        { headers: { authorization: token ? `Bearer ${token}` : '' }, query: { fields: ownerField } },
      ).catch(() => null)
      if (!existing?.data || existing.data[ownerField] !== user!.id) {
        throw createError({ statusCode: 403, statusMessage: 'You can only change your own content' })
      }
    }

    // Spam in user-written content (server/utils/spam.ts): titles,
    // descriptions, bodies… — every top-level text field except links,
    // slugs and ids, which aren't prose.
    if (!admin && SPAM_CHECKED.has(collection) && (method === 'POST' || method === 'PATCH')) {
      const payload = await readBody(event)
      for (const item of Array.isArray(payload) ? payload : [payload]) {
        const fields = item && typeof item === 'object' ? Object.keys(item).filter((k) => !NOT_PROSE.test(k)) : []
        const createdAt = (user as { createdAt?: string | Date } | null)?.createdAt
        const verdict = checkSpam(contentText(item, fields), {
          authorId: user?.id,
          scope: collection,
          accountAgeHours: createdAt ? (Date.now() - new Date(createdAt).getTime()) / 3_600_000 : null,
        })
        if (verdict.spam) {
          console.warn(`[spam] refused ${method} ${collection} by ${user?.id}: ${verdict.reasons.join(', ')}`)
          throw createError({ statusCode: 422, statusMessage: 'This looks like spam, so it wasn\'t saved. If it isn\'t, remove links or repeated text and try again.' })
        }
      }
    }

    if (ownerField && (method === 'POST' || method === 'PATCH')) {
      const payload = await readBody(event)
      const stamp = (item: Record<string, unknown>) => {
        if (!item || typeof item !== 'object') return item
        const next = { ...item }
        if (method === 'POST') next[ownerField] = user!.id
        else delete next[ownerField]
        return next
      }
      body = JSON.stringify(Array.isArray(payload) ? payload.map(stamp) : stamp(payload))
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
    onResponse: (ev: typeof event, response: Response) => {
      // This proxy is same-origin only — don't pass on Directus' own CORS
      // headers (it sends `Access-Control-Allow-Origin: *` + credentials).
      for (const name of [...response.headers.keys()]) {
        if (name.startsWith('access-control-')) ev.node.res.removeHeader(name)
      }
      // Library files are served from this origin: never let one run as a page.
      if (pathOnly.startsWith('/assets/')) {
        setResponseHeader(ev, 'x-content-type-options', 'nosniff')
        setResponseHeader(ev, 'content-security-policy', "sandbox; default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'")
        const type = (response.headers.get('content-type') || '').toLowerCase()
        if (!/^(image\/(png|jpe?g|gif|webp|avif|heic|heif)|video\/|audio\/|application\/pdf)/.test(type)) {
          setResponseHeader(ev, 'content-disposition', 'attachment')
        }
      }
    },
  })
})
