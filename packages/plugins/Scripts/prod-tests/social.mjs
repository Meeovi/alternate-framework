// Production tests for the social layer (layers/social): page gating, API
// auth, member privacy, ownership of lists / calendar events, follows,
// views, notify-followers and the social driver. See lib.mjs.
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { Jar, req, test, section, finish, expect, blocked, loadAccounts, repoRoot, signInJar, isTurnstileRefusal, turnstileGate } from './lib.mjs'

const accounts = loadAccounts()
if (!accounts.user || !accounts.seller) throw new Error('QA accounts missing — run auth.mjs first')
const U = accounts.user, S = accounts.seller

// Password sign-in is behind Turnstile: open the session directly (lib.mjs).
const signIn = (account) => signInJar(account)
const location = (r) => (r.headers.get('location') || '').replace(/^https?:\/\/[^/]+/, '')
const errorTitle = (r) => {
  const title = r.text.match(/<title>([^<]*)/)?.[1] ?? ''
  return /^\s*(500|503)\b|Internal Server Error/i.test(title) ? title : null
}
async function pool(items, size, fn) {
  const out = []; let i = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]) } catch (e) { out[k] = { status: 0, headers: new Headers(), text: String(e?.cause?.code || e.message) } } }
  }))
  return out
}

// ---- pages, from the layer ----------------------------------------------
function walk(dir) {
  return readdirSync(dir).flatMap((n) => { const f = join(dir, n); return statSync(f).isDirectory() ? walk(f) : n.endsWith('.vue') ? [f] : [] })
}
const pagesDir = join(repoRoot, 'layers/social/app/pages')
const pages = walk(pagesDir).sort()
  .map(f => '/' + relative(pagesDir, f).replace(/\.vue$/, '').replace(/(^|\/)index$/, '').replace(/\[\.\.\.[^\]]+\]|\[[^\]]+\]/g, '1'))
  .filter(r => !/\/[A-Z][A-Za-z]+$/.test(r)) // components living in pages/ (e.g. space/SettingsTab)

const jars = {}
section('Setup')
await test('SETUP', 'QA user and seller can sign in', async () => {
  jars.user = await signIn(U)
  jars.seller = await signIn(S)
})

// ---------------------------------------------------------------------------
section(`Social pages (${pages.length})`)
const anon = await pool(pages, 3, p => req('GET', p))
await test('G1', 'every social page sends a signed-out visitor to /login', async () => {
  const open = pages.filter((p, i) => !([301, 302, 307].includes(anon[i].status) && location(anon[i]).startsWith('/login')))
  expect(!open.length, open.map((p) => `${p} (${anon[pages.indexOf(p)].status})`).join(', '))
})
await test('G2', 'no social page errors for a signed-in user', async () => {
  const res = await pool(pages, 3, p => req('GET', p, { jar: jars.user }))
  const broken = pages.map((p, i) => [p, res[i]]).filter(([, r]) => r.status === 0 || r.status >= 500 || errorTitle(r))
  expect(!broken.length, broken.map(([p, r]) => `${p} → ${r.status} ${errorTitle(r) ?? ''}`).join('; '))
})

// ---------------------------------------------------------------------------
section('API authentication')
const AUTHED = [
  ['POST', '/api/activity/create'], ['GET', '/api/feed/stream'], ['GET', '/api/social/feed'],
  ['GET', '/api/social/calendar/events'], ['POST', '/api/social/calendar/events'], ['GET', '/api/social/calendar/groups'],
  ['POST', '/api/social/follow'], ['GET', '/api/social/list-saved'], ['POST', '/api/social/list-saved'],
  ['GET', '/api/social/lists'], ['POST', '/api/social/lists'], ['GET', '/api/social/lists/1'],
  ['GET', '/api/social/members'], ['GET', `/api/social/members/${U.id}`], ['POST', '/api/social/notify-followers'],
  ['POST', '/api/social/publish'], ['POST', '/api/social/views/post/1'], ['POST', '/api/upload-video'],
  ['GET', '/api/social/spaces/1/media'], ['POST', '/api/social/atproto/post'], ['POST', '/api/social/atproto/follow'],
]
await test('A1', 'signed-in-only endpoints refuse a signed-out caller', async () => {
  const open = []
  for (const [m, p] of AUTHED) {
    const r = await req(m, p, m === 'GET' ? {} : { json: {} })
    // Form routes answer the Turnstile gate first (403) — also a refusal.
    if (r.status !== 401 && !isTurnstileRefusal(r)) open.push(`${m} ${p} → ${r.status}`)
  }
  expect(!open.length, open.join('; '))
})
await test('A2', 'public endpoints answer without errors', async () => {
  const notes = []
  for (const p of ['/api/social/federation', `/api/social/avatars?ids=${U.id}`, '/api/social/atproto/status', '/api/social/atproto/suggested-members']) {
    const r = await req('GET', p)
    expect(r.status < 500, `${p} → ${r.status}`)
    notes.push(`${p.split('/').pop().split('?')[0]} ${r.status}`)
  }
  return notes.join(', ')
})
await test('A3', 'avatars returns only images', async () => {
  const r = await req('GET', `/api/social/avatars?ids=${U.id},${S.id}`)
  expect(r.status === 200, `HTTP ${r.status}`)
  expect(!/@|resend\.dev|email/i.test(r.text), 'response contains more than image URLs')
})

// ---------------------------------------------------------------------------
section('Members (privacy)')
await test('M1', 'member search finds QA users without exposing emails', async () => {
  const r = await req('GET', '/api/social/members?q=qa', { jar: jars.user })
  expect(r.status === 200, `HTTP ${r.status}`)
  expect(/qauser|qaseller/.test(r.text), 'QA users not found by "qa"')
  expect(!/@resend\.dev|"email"/i.test(r.text), 'emails exposed in member search')
})
await test('M2', 'member lookup returns public fields only', async () => {
  const r = await req('GET', `/api/social/members/${S.id}`, { jar: jars.user })
  expect(r.status === 200 && r.body?.id === S.id, `HTTP ${r.status}`)
  expect(Object.keys(r.body).every(k => ['id', 'name', 'username', 'image'].includes(k)), `extra fields: ${Object.keys(r.body).join(',')}`)
})

// ---------------------------------------------------------------------------
section('Lists (ownership)')
let listId = null
await test('L1', 'create a list', async () => {
  const r = await req('POST', '/api/social/lists', { jar: jars.user, json: { name: 'QA list (auto-deleted)', status: 'draft' } })
  turnstileGate(r)
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 140)}`)
  listId = r.body?.id ?? r.body?.data?.id
  expect(listId, `no id in ${r.text.slice(0, 120)}`)
})
await test('L2', 'the owner can read and edit it', async () => {
  if (!listId) blocked('no list')
  expect((await req('GET', `/api/social/lists/${listId}`, { jar: jars.user })).status === 200, 'owner GET failed')
  const r = await req('PATCH', `/api/social/lists/${listId}`, { jar: jars.user, json: { name: 'QA list (edited)' } })
  expect(r.status === 200, `owner PATCH HTTP ${r.status}`)
})
await test('L3', "another user can't read, edit or delete it", async () => {
  if (!listId) blocked('no list')
  for (const [m, json] of [['GET'], ['PATCH', { name: 'hijacked' }], ['DELETE']]) {
    const r = await req(m, `/api/social/lists/${listId}`, { jar: jars.seller, ...(json ? { json } : {}) })
    expect(r.status === 404 || r.status === 403, `${m} → HTTP ${r.status}`)
  }
})
await test('L4', 'the owner can delete it', async () => {
  if (!listId) blocked('no list')
  const r = await req('DELETE', `/api/social/lists/${listId}`, { jar: jars.user })
  expect(r.status === 200 || r.status === 204, `HTTP ${r.status}`)
  listId = null
})

// ---------------------------------------------------------------------------
section('Calendar events (ownership)')
let eventId = null
await test('E1', 'create an event (owner forced from the session)', async () => {
  const start = new Date(Date.now() + 86400000)
  const r = await req('POST', '/api/social/calendar/events', { jar: jars.user, json: {
    text: 'QA event (auto-deleted)', start_date: start.toISOString(), end_date: new Date(+start + 3600000).toISOString(), user: S.id } })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 140)}`)
  eventId = r.body?.id ?? r.body?.data?.id
  expect(eventId, 'no id returned')
  const owner = r.body?.user ?? r.body?.data?.user
  expect(!owner || owner === U.id, `event owned by ${owner}, not the creator`)
})
await test('E2', "another user can't edit or delete it", async () => {
  if (!eventId) blocked('no event')
  for (const [m, json] of [['PATCH', { text: 'hijacked' }], ['DELETE']]) {
    const r = await req(m, `/api/social/calendar/events/${eventId}`, { jar: jars.seller, ...(json ? { json } : {}) })
    expect(r.status === 404 || r.status === 403, `${m} → HTTP ${r.status}`)
  }
})
await test('E3', 'the owner can edit and delete it', async () => {
  if (!eventId) blocked('no event')
  const p = await req('PATCH', `/api/social/calendar/events/${eventId}`, { jar: jars.user, json: { text: 'QA event (edited)' } })
  expect(p.status === 200, `PATCH HTTP ${p.status}`)
  const d = await req('DELETE', `/api/social/calendar/events/${eventId}`, { jar: jars.user })
  expect(d.status === 200 || d.status === 204, `DELETE HTTP ${d.status}`)
  eventId = null
})

// ---------------------------------------------------------------------------
section('Follows')
const followStatus = async () => {
  const r = await req('GET', `/api/social/follow-status?targetType=user&targetId=${S.id}`, { jar: jars.user })
  return r.body?.following ?? r.body?.isFollowing ?? r.body
}
await test('F1', "can't follow yourself", async () => {
  const r = await req('POST', '/api/social/follow', { jar: jars.user, json: { targetType: 'user', targetId: U.id } })
  expect(r.status === 400, `HTTP ${r.status}`)
})
await test('F2', 'follow then unfollow another user', async () => {
  const before = await followStatus()
  const a = await req('POST', '/api/social/follow', { jar: jars.user, json: { targetType: 'user', targetId: S.id } })
  expect(a.status === 200, `follow HTTP ${a.status}: ${a.text.slice(0, 120)}`)
  const mid = await followStatus()
  const b = await req('POST', '/api/social/follow', { jar: jars.user, json: { targetType: 'user', targetId: S.id } })
  expect(b.status === 200, `toggle HTTP ${b.status}`)
  const after = await followStatus()
  expect(JSON.stringify(mid) !== JSON.stringify(after), `status didn't change (${JSON.stringify(before)} → ${JSON.stringify(mid)} → ${JSON.stringify(after)})`)
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    await req('POST', '/api/social/follow', { jar: jars.user, json: { targetType: 'user', targetId: S.id } })
  }
  return `${JSON.stringify(mid)} → ${JSON.stringify(after)}`
})
await test('F3', 'invalid follow payloads are refused', async () => {
  const r = await req('POST', '/api/social/follow', { jar: jars.user, json: { targetType: 'admin', targetId: S.id } })
  expect(r.status === 400, `HTTP ${r.status}`)
})

// ---------------------------------------------------------------------------
section('Views and notifications')
await test('V1', 'views reject unknown content types and bad ids', async () => {
  const a = await req('POST', '/api/social/views/nonsense/1', { jar: jars.user, json: {} })
  expect(a.status === 404, `type → ${a.status}`)
  // (A '..%2F' id gets normalised upstream into a different URL, so use plain bad characters.)
  const b = await req('POST', '/api/social/views/post/abc!def', { jar: jars.user, json: {} })
  expect(b.status === 400 || b.status === 404, `id → ${b.status}`)
})
await test('V2', 'a view counts once per user per day', async () => {
  const list = await req('GET', '/api/cms/items/shorts?limit=1&fields=id&filter[status][_in]=published,Published', { jar: jars.user })
  const id = list.body?.data?.[0]?.id
  if (!id) blocked('no published vibe to view')
  const first = await req('POST', `/api/social/views/shorts/${id}`, { jar: jars.seller, json: {} })
  const second = await req('POST', `/api/social/views/shorts/${id}`, { jar: jars.seller, json: {} })
  expect(first.status === 200 && second.status === 200, `HTTP ${first.status}/${second.status}`)
  expect(second.body?.counted === false, `second view counted: ${second.text.slice(0, 100)}`)
  return `first counted=${first.body?.counted}, second counted=${second.body?.counted}`
})
await test('V3', 'notify-followers refuses content that does not exist / is not yours', async () => {
  const r = await req('POST', '/api/social/notify-followers', { jar: jars.user, json: { contentType: 'post', itemId: 999999999 } })
  expect(r.status >= 400 && r.status < 500, `accepted (HTTP ${r.status} ${r.text.slice(0, 80)}) — any user can trigger "new post" notifications to all their followers for any id, without limit`)
})

// ---------------------------------------------------------------------------
section('Social driver (POST /api/social/driver)')
await test('D1', 'methods outside the allow-list are refused', async () => {
  for (const m of ['constructor', '__proto__', 'deleteEverything', '']) {
    const r = await req('POST', '/api/social/driver', { jar: jars.user, json: { method: m } })
    expect(r.status === 403 || r.status === 400, `"${m}" → HTTP ${r.status}`)
  }
})

finish('/home/meebuzo/.meeovi-demo/test-results-social.json')
