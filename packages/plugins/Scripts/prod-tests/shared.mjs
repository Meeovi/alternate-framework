// Production tests for the shared layer (layers/shared): the CMS proxy
// (/api/cms), the generic Directus proxy (/api/proxy), uploads/assets, the
// Novu session, security headers, sitemap/robots. See lib.mjs.
import { Jar, req, test, section, finish, expect, blocked, loadAccounts, signInJar } from './lib.mjs'

const accounts = loadAccounts()
if (!accounts.user || !accounts.admin) throw new Error('QA accounts missing — run auth.mjs first')

// Password sign-in is behind Turnstile: open the session directly (lib.mjs).
const signIn = (account) => signInJar(account)
const jars = {}
// Must match ADMIN_WRITE_COLLECTIONS in layers/shared/server/api/cms/[...].ts
const SITE_CONTENT = ['navigation', 'pages', 'page_blocks', 'blocks', 'brands', 'shops', 'departments', 'categories',
  'about_departments', 'products', 'product_variants', 'attributes', 'articles', 'coupons', 'incentives', 'callouts',
  'currencies', 'tags', 'videos']
const SENSITIVE = /order|customer|payment|invoice|message|notification|address|token|secret|subscription|transaction|wallet|report|feedback|session|password|billing|payout|credit|refund|audit|_logs?$|private|^dm_|chat/i

section('Setup')
await test('SETUP', 'QA user and admin can sign in', async () => {
  jars.user = await signIn(accounts.user)
  jars.admin = await signIn(accounts.admin)
})

// ---------------------------------------------------------------------------
section('CMS proxy — reads')
await test('C1', 'public CMS content is readable signed out', async () => {
  const r = await req('GET', '/api/cms/items/navigation/36?fields=id,name')
  expect(r.status === 200 && r.body?.data?.id === 36, `HTTP ${r.status}`)
})
await test('C1b', 'the site menus load (`menus.*` on a JSON field)', async () => {
  // The header/account menus ask for `fields=*,menus.*`; `menus` is a JSON
  // repeater, not a relation — the relation guard once refused it (400).
  const r = await req('GET', '/api/cms/items/navigation/2?fields=*%2Cmenus.*')
  expect(r.status === 200 && Array.isArray(r.body?.data?.menus), `HTTP ${r.status}: ${r.body?.message ?? ''}`)
})
await test('C2', 'non-public collections need a session', async () => {
  const r = await req('GET', '/api/cms/items/posts?limit=1&fields=id')
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('C3', 'Directus system endpoints are blocked even when signed in', async () => {
  const open = []
  for (const p of ['/users', '/users/me', '/roles', '/policies', '/permissions', '/settings', '/flows', '/operations',
    '/schema/snapshot', '/relations', '/collections', '/server/info', '/activity', '/revisions', '/graphql', '/extensions', '/presets']) {
    const r = await req('GET', `/api/cms${p}`, { jar: jars.user })
    if (r.status === 200) open.push(p)
  }
  expect(!open.length, `reachable: ${open.join(', ')}`)
})
await test('C4', 'Directus system tables are not readable through /items', async () => {
  const open = []
  for (const c of ['directus_users', 'directus_settings', 'directus_roles', 'directus_permissions', 'directus_sessions', 'directus_activity', 'directus_flows']) {
    const r = await req('GET', `/api/cms/items/${c}?limit=1`, { jar: jars.user })
    if (r.status === 200) open.push(c)
  }
  expect(!open.length, `readable: ${open.join(', ')}`)
})
await test('C5', 'no sensitive collection is readable by an ordinary signed-in user', async () => {
  const url = process.env.DIRECTUS_URL, token = process.env.DIRECTUS_STATIC_TOKEN
  if (!url || !token) blocked('DIRECTUS_URL / DIRECTUS_STATIC_TOKEN not in env — cannot list collections')
  const list = await fetch(`${url.replace(/\/$/, '')}/collections?limit=-1`, { headers: { authorization: `Bearer ${token}` } }).then(r => r.json())
  const names = (list.data ?? []).filter(c => !c.collection.startsWith('directus_') && c.schema).map(c => c.collection).sort()
  const readable = []
  for (const name of names) {
    const r = await req('GET', `/api/cms/items/${name}?limit=1&aggregate[count]=*`, { jar: jars.user })
    const count = Number(r.body?.data?.[0]?.count ?? 0)
    if (r.status === 200 && count > 0) readable.push(`${name}(${count})`)
  }
  const sensitive = readable.filter(x => SENSITIVE.test(x))
  expect(!sensitive.length, `sensitive collections with data readable by any user: ${sensitive.join(', ')}`)
  return `${readable.length}/${names.length} collections with data are readable by any signed-in user`
})

await test('C6', 'protected tables cannot be reached through a relation', async () => {
  // cities → users_cities → users (the auth table). Every query form that
  // follows a relation must be refused, not just /items/users itself.
  const enc = (o) => encodeURIComponent(JSON.stringify(o))
  const open = []
  for (const q of [
    'fields=users.users_id.email',
    'fields[]=users.users_id.email',
    'fields=*.*.*',
    `filter=${enc({ users: { users_id: { email: { _nnull: true } } } })}`,
    'filter[users][users_id][email][_nnull]=true',
    `filter=${enc({ users: { _some: { users_id: { auth_role: { _eq: 'admin' } } } } })}`,
    `deep=${enc({ users: { _filter: { users_id: { email: { _nnull: true } } } } })}`,
    'sort=-users.users_id.email',
    `alias=${enc({ x: 'users' })}&fields=x.users_id.email`,
  ]) {
    const r = await req('GET', `/api/cms/items/cities?limit=1&${q}`, { jar: jars.user })
    if (r.status < 400) open.push(`${q} → ${r.status}`)
  }
  const s = await req('GET', '/api/cms/items/shipment?limit=1&fields=order.*', { jar: jars.user })
  if (s.status < 400) open.push(`shipment fields=order.* → ${s.status}`)
  expect(!open.length, open.join('; '))
})
await test('C7', "orders / invoices / transactions only ever return the caller's own rows", async () => {
  const leaks = []
  for (const [c, f] of [['orders', 'user_id'], ['invoices', 'user'], ['transactions', 'order.user_id']]) {
    // The client filter is AND-ed with the server's, so asking for "everyone" gets nothing extra.
    const r = await req('GET', `/api/cms/items/${c}?limit=50&fields=id,${f}&filter=${encodeURIComponent('{"id":{"_nnull":true}}')}`, { jar: jars.user })
    if (r.status !== 200) { leaks.push(`${c} list → HTTP ${r.status}`); continue }
    const owner = (row) => f.split('.').reduce((v, k) => v?.[k], row)
    const foreign = (r.body?.data ?? []).filter(row => owner(row) !== accounts.user.id)
    if (foreign.length) leaks.push(`${c}: ${foreign.length} other users' rows`)
    const one = await req('GET', `/api/cms/items/${c}/1?fields=id`, { jar: jars.user })
    if (one.status === 200 && one.body?.data && owner(one.body.data) !== accounts.user.id) leaks.push(`${c}/1 readable`)
    const w = await req('PATCH', `/api/cms/items/${c}/999999999`, { jar: jars.user, json: { status: 'x' } })
    if (w.status !== 403) leaks.push(`${c} PATCH → HTTP ${w.status}`)
  }
  expect(!leaks.length, leaks.join('; '))
})
await test('C8', 'unusual methods and path tricks are refused', async () => {
  const bad = []
  const s = await req('SEARCH', '/api/cms/items/posts', { jar: jars.user, json: { query: { fields: ['*'] } } })
  if (s.status !== 405) bad.push(`SEARCH → ${s.status}`)
  for (const p of ['/api/cms/items/navigation/%2e%2e/%2e%2e/users', '/api/cms/translations', '/api/cms/comments', '/api/cms/fields/accounts']) {
    const r = await req('GET', p, { jar: jars.user })
    if (r.status < 400) bad.push(`${p} → ${r.status}`)
  }
  expect(!bad.length, bad.join('; '))
})

// ---------------------------------------------------------------------------
section('CMS proxy — writes')
await test('W0', 'nested writes into another collection are refused', async () => {
  // Nonexistent ids throughout: even if the guard failed, nothing would change.
  const open = []
  for (const [c, body] of [
    ['cities', { users: [{ users_id: { id: '00000000-0000-0000-0000-000000000000', auth_role: 'admin' } }] }],
    ['cities', { users: { create: [], update: [{ id: 999999999, users_id: { auth_role: 'admin' } }], delete: [] } }],
    ['shipment', { order: { id: 999999999, grand_total: 0 } }],
  ]) {
    const r = await req('PATCH', `/api/cms/items/${c}/999999999`, { jar: jars.user, json: body })
    if (r.status !== 403) open.push(`${c} ${Object.keys(body)[0]} → HTTP ${r.status}`)
  }
  expect(!open.length, open.join('; '))
})
await test('W1', 'signed-out writes are refused', async () => {
  const r = await req('PATCH', '/api/cms/items/navigation/36', { json: {} })
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('W2', 'an ordinary user cannot change site content (empty PATCH probe)', async () => {
  const allowed = []
  for (const c of SITE_CONTENT) {
    const list = await req('GET', `/api/cms/items/${c}?limit=1&fields=id`, { jar: jars.admin })
    const id = list.body?.data?.[0]?.id
    if (id === undefined) continue
    const r = await req('PATCH', `/api/cms/items/${c}/${id}`, { jar: jars.user, json: {} })
    if (r.status !== 403) allowed.push(`${c} (${r.status})`)
  }
  expect(!allowed.length, `writable by a plain user: ${allowed.join(', ')}`)
})
await test('W3', 'an ordinary user cannot create site content', async () => {
  const r = await req('POST', '/api/cms/items/navigation', { jar: jars.user, json: { name: 'qa-should-not-exist' } })
  expect(r.status === 403, `HTTP ${r.status}${r.body?.data?.id ? ` — created navigation ${r.body.data.id}!` : ''}`)
})
await test('W4', 'an admin can still change site content', async () => {
  const r = await req('PATCH', '/api/cms/items/navigation/36', { jar: jars.admin, json: {} })
  expect(r.status === 200, `HTTP ${r.status}`)
})
await test('W5', "a user cannot change someone else's profile", async () => {
  const other = await req('GET', `/api/cms/items/profiles?limit=1&fields=id&filter[id][_neq]=${accounts.user.id}`, { jar: jars.admin })
  const id = other.body?.data?.[0]?.id
  if (!id) blocked('no other profile to probe')
  const r = await req('PATCH', `/api/cms/items/profiles/${id}`, { jar: jars.user, json: {} })
  expect(r.status === 403, `HTTP ${r.status}`)
})
await test('W6', 'a user can create and edit their own profile', async () => {
  let own = await req('GET', `/api/cms/items/profiles/${accounts.user.id}?fields=id`, { jar: jars.user })
  if (own.status !== 200) {
    // Profile rows are keyed by user id; the proxy stamps it from the session.
    const created = await req('POST', '/api/cms/items/profiles', { jar: jars.user, json: { first_name: 'QA', last_name: 'User', id: accounts.admin.id } })
    expect(created.status === 200, `create HTTP ${created.status}: ${created.text.slice(0, 120)}`)
    expect(created.body?.data?.id === accounts.user.id, `profile created with id ${created.body?.data?.id}, not the user's own`)
  }
  const r = await req('PATCH', `/api/cms/items/profiles/${accounts.user.id}`, { jar: jars.user, json: { position: 'QA tester' } })
  expect(r.status === 200, `edit HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})
await test('W7', "an ordinary user can only write allow-listed collections, and only their own rows", async () => {
  const open = []
  // Collections outside the allow-list: refused before Directus is asked (ids don't exist anyway).
  for (const c of ['lists', 'list_items', 'list_products', 'follows', 'comments', 'notifications', 'friend_requests', 'cities']) {
    const r = await req('PATCH', `/api/cms/items/${c}/999999999`, { jar: jars.user, json: {} })
    if (r.status !== 403) open.push(`PATCH ${c} → ${r.status}`)
  }
  // Owned collections: someone else's existing row.
  for (const [c, f] of [['spaces', 'owner'], ['reactions', 'user_id'], ['websites', 'creator']]) {
    const other = await req('GET', `/api/cms/items/${c}?limit=1&fields=id&filter[${f}][_neq]=${accounts.user.id}`, { jar: jars.admin })
    const id = other.body?.data?.[0]?.id
    if (!id) continue
    const r = await req('PATCH', `/api/cms/items/${c}/${id}`, { jar: jars.user, json: {} })
    if (r.status !== 403) open.push(`PATCH ${c}/${id} → ${r.status}`)
  }
  for (const [m, p] of [['PATCH', '/api/cms/items/report/999999999'], ['DELETE', '/api/cms/items/report/999999999'], ['PATCH', '/api/cms/files/00000000-0000-0000-0000-000000000000'], ['POST', '/api/cms/files']]) {
    const r = await req(m, p, { jar: jars.user, json: {} })
    if (r.status !== 403) open.push(`${m} ${p} → ${r.status}`)
  }
  expect(!open.length, open.join('; '))
})

// ---------------------------------------------------------------------------
section('Generic Directus proxy (/api/proxy)')
await test('P1', 'signed-out callers are refused', async () => {
  const r = await req('GET', '/api/proxy/items/navigation/36')
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('P2', 'it adds no privileges (no static token)', async () => {
  const r = await req('GET', '/api/proxy/items/directus_users?limit=1', { jar: jars.user })
  expect(r.status !== 200, `directus_users readable: HTTP ${r.status}`)
  const w = await req('PATCH', '/api/proxy/items/navigation/36', { jar: jars.user, json: {} })
  expect(w.status !== 200, `navigation writable through /api/proxy: HTTP ${w.status}`)
})

// ---------------------------------------------------------------------------
section('Uploads and assets (Pixanomy)')
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64')
const upload = (jar, bytes, type, name) => {
  const form = new FormData()
  form.append('category', 'qa-tests')
  form.append('file', new Blob([bytes], { type }), name)
  return req('POST', '/api/assets/upload', { jar, form })
}
await test('U1', 'signed-out uploads are refused', async () => {
  const r = await upload(null, PNG, 'image/png', 'qa.png')
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('U2', 'disallowed file types are refused', async () => {
  const r = await upload(jars.user, Buffer.from('<h1>qa</h1>'), 'text/html', 'qa.html')
  expect(r.status === 415, `HTTP ${r.status}`)
})
await test('U3', 'a small image uploads', async () => {
  const r = await upload(jars.user, PNG, 'image/png', 'qa-pixel.png')
  if (r.status === 503 || /not configured/i.test(r.text)) blocked(`Pixanomy unavailable: ${r.text.slice(0, 100)}`)
  expect(r.status === 200 && r.body?.assets?.length === 1, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  return r.body.assets[0]?.url ?? ''
})
await test('U4', "an HTML file labelled image/png is refused (content isn't trusted)", async () => {
  const r = await upload(jars.user, Buffer.from('<!doctype html><script>alert(1)</script>'), 'image/png', 'qa-spoof.png')
  expect(r.status === 415, `accepted (HTTP ${r.status}) — the upload type is only checked against the client-declared MIME type`)
})
await test('U5', 'assets/mine lists the user’s uploads and needs a session', async () => {
  const anon = await req('GET', '/api/assets/mine')
  expect(anon.status === 401, `signed-out HTTP ${anon.status}`)
  const r = await req('GET', '/api/assets/mine?limit=5', { jar: jars.user })
  expect(r.status === 200 && Array.isArray(r.body?.assets), `HTTP ${r.status}`)
  return `${r.body.assets.length} asset(s)`
})

// ---------------------------------------------------------------------------
section('Notifications (Novu)')
await test('N1', 'Novu session needs a session and is bound to the user', async () => {
  const anon = await req('GET', '/api/novu/session')
  expect(anon.status === 401, `signed-out HTTP ${anon.status}`)
  const r = await req('GET', '/api/novu/session', { jar: jars.user })
  if (r.status >= 500) blocked(`Novu unavailable: HTTP ${r.status} ${r.body?.statusMessage ?? ''}`)
  expect(r.status === 200 && r.body?.subscriberId === accounts.user.id && r.body?.subscriberHash, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})
await test('N2', '/notifications needs a session', async () => {
  const r = await req('GET', '/notifications')
  expect([301, 302, 307].includes(r.status) && /\/login/.test(r.headers.get('location') || ''), `HTTP ${r.status} → ${r.headers.get('location') ?? ''}`)
})

// ---------------------------------------------------------------------------
section('Site-wide headers and SEO files')
await test('H1', 'security headers on HTML pages', async () => {
  const r = await req('GET', '/login')
  const h = (n) => r.headers.get(n)
  // CSP is in Report-Only rollout (see buildContentSecurityPolicy) — once
  // the reports are clean this should require the enforced header instead.
  const missing = ['content-security-policy-report-only', 'reporting-endpoints', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'strict-transport-security'].filter(n => !h(n))
  expect(!missing.length, `missing: ${missing.join(', ')}`)
  const csp = h('content-security-policy-report-only') || ''
  for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'", 'report-uri /api/csp-report']) {
    expect(csp.includes(d), `CSP lacks ${d}`)
  }
  return h('content-security-policy') ? 'note: an enforced CSP is also being sent' : 'report-only'
})
await test('H1b', 'the CSP report endpoint accepts both report formats', async () => {
  const legacy = await req('POST', '/api/csp-report', { json: { 'csp-report': { 'document-uri': 'https://demo.meeovicms.com/qa', 'violated-directive': 'script-src-elem', 'blocked-uri': 'https://qa.invalid/x.js?token=secret' } } })
  const modern = await req('POST', '/api/csp-report', { json: [{ type: 'csp-violation', body: { documentURL: 'https://demo.meeovicms.com/qa', effectiveDirective: 'img-src', blockedURL: 'data' } }] })
  expect(legacy.status === 204 && modern.status === 204, `HTTP ${legacy.status}/${modern.status}`)
})
await test('H2', 'robots.txt is served', async () => {
  const r = await req('GET', '/robots.txt')
  expect(r.status === 200 && /user-agent/i.test(r.text), `HTTP ${r.status}`)
})
await test('H3', 'sitemap.xml is served and lists pages', async () => {
  // /sitemap.xml redirects to a per-locale sitemap index.
  const r = await req('GET', '/sitemap.xml', { redirect: 'follow' })
  expect(r.status === 200, `HTTP ${r.status}`)
  const locs = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  expect(locs.length >= 1, 'no <loc> entries')
  const foreign = locs.filter(u => !u.startsWith(new URL('/', process.env.PROD_TEST_BASE_URL || 'https://demo.meeovicms.com').origin))
  return `${locs.length} entries` + (foreign.length ? ` — note: points at another host (${new URL(foreign[0]).host}); the sitemap uses the build-time site URL` : '')
})

finish('/home/meebuzo/.meeovi-demo/test-results-shared.json')
