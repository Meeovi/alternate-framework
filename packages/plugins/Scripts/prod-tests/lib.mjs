// Tiny dependency-free runner for production tests against a deployed app
// (default https://demo.meeovicms.com). One file per layer imports this.
//
//   node --env-file=apps/ecosystem/meeovi-frontend/.env \
//     packages/plugins/Scripts/prod-tests/auth.mjs [--only=<substring>]
//
// Env: PROD_TEST_BASE_URL (default https://demo.meeovicms.com),
//      NUXT_DATABASE_URL / BETTER_AUTH_SECRET (from the app .env) for DB checks
//      and the run's test accounts; ROCKETCHAT_*, NOVU_* and NUXT_PIXANOMY_*
//      (also from the app .env) to delete what those accounts left there,
//      PROD_TEST_REPORT_DIR to write reports somewhere other than the demo's,
//      PROD_TEST_SECURE_COOKIE=1 for a production build served over plain
//      http (a private copy on localhost): it still names its session cookie
//      __Secure-.
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = resolve(here, '../../../..')
export const requireFromRepo = createRequire(resolve(repoRoot, 'package.json'))

export const BASE = (process.env.PROD_TEST_BASE_URL || 'https://demo.meeovicms.com').replace(/\/$/, '')
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice(7)

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** Cookie jar per simulated browser. */
export class Jar {
  constructor() { this.cookies = new Map() }
  absorb(res) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair, ...attrs] = line.split(';')
      const eq = pair.indexOf('=')
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      const expired = attrs.some(a => /max-age=0\b/i.test(a)) || value === ''
      if (expired) this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }
  header() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ') }
}

/**
 * Per-path pacing so a run stays under better-auth's per-IP rate limits
 * (layers/auth/server/utils/auth.ts → rateLimit.customRules, plus
 * better-auth's built-in special rules). better-auth only resets a counter
 * after a gap longer than the window since the LAST request — evenly spaced
 * requests keep counting up — so spend (max - 1) calls, then wait out a
 * full window.
 */
const LIMITS = {
  '/api/auth/sign-up/email': { window: 60, max: 3 },
  '/api/auth/sign-in/email': { window: 60, max: 5 },
  '/api/auth/sign-in/username': { window: 60, max: 5 },
  '/api/auth/change-password': { window: 60, max: 5 },
  '/api/auth/request-password-reset': { window: 60, max: 3 },
}
const budget = new Map()
async function paceRequest(path) {
  const rule = LIMITS[path]
  if (!rule) return
  const state = budget.get(path) ?? { count: 0, last: 0 }
  if (Date.now() - state.last > rule.window * 1000) state.count = 0
  if (state.count >= rule.max - 1) {
    const wait = state.last + rule.window * 1000 + 1500 - Date.now()
    if (wait > 0) await sleep(wait)
    state.count = 0
  }
  state.count++
  state.last = Date.now()
  budget.set(path, state)
}

// nuxt-security's rateLimiter (layers/shared/nuxt.config.ts) allows 150
// requests per minute per client IP across the whole site — stay under it.
const GLOBAL_PER_MINUTE = 140
const recent = []
async function paceGlobal() {
  for (;;) {
    const now = Date.now()
    while (recent.length && now - recent[0] > 60_000) recent.shift()
    if (recent.length < GLOBAL_PER_MINUTE) { recent.push(now); return }
    await sleep(recent[0] + 60_000 - now + 50)
  }
}

export async function req(method, path, { json, form, jar, headers = {}, redirect = 'manual', pace = true } = {}) {
  if (pace) await paceRequest(path.split('?')[0])
  await paceGlobal()
  // Cloudflare drops idle keep-alive connections that undici then reuses
  // (ECONNRESET / "fetch failed"). GETs are safe to retry; anything that
  // changes state is not, so those surface the error.
  const attempts = method === 'GET' ? 3 : 1
  let res
  for (let attempt = 1; ; attempt++) {
    try {
      res = await doFetch(method, path, { json, form, jar, headers, redirect })
      break
    } catch (e) {
      if (attempt >= attempts) throw e
      networkRetries++
      await sleep(500 * attempt)
    }
  }
  jar?.absorb(res)
  const text = await res.text()
  let body = null
  try { body = JSON.parse(text) } catch { /* not JSON */ }
  return { status: res.status, headers: res.headers, text, body, setCookies: res.headers.getSetCookie?.() ?? [] }
}

export let networkRetries = 0

function doFetch(method, path, { json, form, jar, headers, redirect }) {
  return fetch(BASE + path, {
    method,
    redirect,
    headers: {
      // better-auth rejects state-changing requests without a trusted Origin.
      origin: BASE,
      'user-agent': 'meeovi-prod-tests/1.0',
      ...(json !== undefined ? { 'content-type': 'application/json' } : {}),
      ...(jar ? { cookie: jar.header() } : {}),
      ...headers,
    },
    // `form` is a FormData (multipart) — fetch sets its own content-type.
    body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
  })
}

/** Direct DB access for fixture setup and for checks the API can't show. */
export async function withDb(fn) {
  const pg = requireFromRepo('pg')
  const client = new pg.Client({ connectionString: process.env.NUXT_DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try { return await fn(client) } finally { await client.end() }
}

/**
 * A signed-in cookie jar for a test account. Password sign-in is behind
 * Turnstile on the demo, which scripts can't solve, so this opens the
 * session the way better-auth does: a `sessions` row plus the session
 * cookie (`<token>.<base64 HMAC-SHA256(token, BETTER_AUTH_SECRET)>`).
 * Signing out (POST /api/auth/sign-out with the jar) deletes the row.
 */
export async function signInJar(account) {
  if (!account?.id) throw new Blocked('test account missing')
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET not in env — cannot open a test session')
  const token = randomBytes(24).toString('base64url')
  await withDb((db) => db.query(
    `insert into sessions (id, user_id, token, expires_at, created_at, updated_at, ip_address, user_agent)
     values ($1, $2, $3, now() + interval '2 hours', now(), now(), '127.0.0.1', 'meeovi-prod-tests')`,
    [randomUUID(), account.id, token],
  ))
  const signature = createHmac('sha256', secret).update(token).digest('base64')
  const secure = BASE.startsWith('https://') || process.env.PROD_TEST_SECURE_COOKIE === '1'
  const name = `${secure ? '__Secure-' : ''}custom_session_token`
  const jar = new Jar()
  jar.cookies.set(name, encodeURIComponent(`${token}.${signature}`))
  return jar
}

// ---- test accounts ------------------------------------------------------
// Every run makes its own accounts and deletes them when it ends: no test
// account is kept anywhere between runs. They're written straight to the DB,
// so no sign-up (Turnstile) and no store customer from the user.create hook.
// Deleting also removes what the run gave them elsewhere: their Rocket.Chat
// user, Novu subscriber and upload folder.
const ROLES = { user: null, seller: 'user,seller', admin: 'admin' }
// Resend's test inbox: accepted and never delivered, so no bounces.
export const emailFor = (username) => `delivered+${username}@resend.dev`
const TEST_EMAIL = /^delivered\+qa(user|seller|admin)[0-9a-f]{6}@resend\.dev$/
const created = []

/** `{ user, seller, admin }` → `{ id, username, name, email, password }` each. */
export async function createTestAccounts(keys = ['user', 'seller', 'admin']) {
  await sweepStaleTestAccounts()
  // Hashed the way the app does (layers/auth/server/utils/password.ts).
  const { hash } = requireFromRepo('@node-rs/argon2')
  const hashPassword = (password) => hash(password, { memoryCost: 65536, timeCost: 3, parallelism: 4, outputLen: 32, algorithm: 2 })
  const accounts = {}
  for (const key of keys) {
    const username = `qa${key}${randomBytes(3).toString('hex')}`
    const account = {
      id: randomUUID(), username, name: `QA ${key[0].toUpperCase()}${key.slice(1)}`,
      email: emailFor(username), password: `Qa!${randomBytes(15).toString('base64url')}9a`,
    }
    // better-auth's role lives in users.auth_role (admin plugin field
    // mapping) — users.role is Supabase's own column (used by RLS).
    await withDb(async (db) => {
      await db.query(
        `insert into public.users (id, name, email, email_verified, username, auth_role, created_at, updated_at)
         values ($1, $2, $3, true, $4, $5, now(), now())`,
        [account.id, account.name, account.email, username, ROLES[key] ?? null])
      // A credential account's id is the user's id (accountId → "id").
      await db.query(
        `insert into public.accounts (id, user_id, provider_id, password) values ($1, $1, 'credential', $2)`,
        [account.id, await hashPassword(account.password)])
    })
    created.push(account)
    accounts[key] = account
  }
  return accounts
}

/** Deletes this run's accounts. Call it before finish(). */
export async function deleteTestAccounts() {
  const ids = created.splice(0).map((a) => a.id)
  if (ids.length) await purgeAccounts(ids)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await deleteTestAccounts().catch((e) => console.error('test account cleanup failed:', e.message))
    process.exit(130)
  })
}

// Accounts a crashed run left behind: test emails only, checked one by one,
// and old enough that no other run is still using them.
async function sweepStaleTestAccounts() {
  const { rows } = await withDb((db) => db.query(
    `select id, email from public.users where email like 'delivered+qa%@resend.dev' and created_at < now() - interval '2 hours'`))
  const stale = rows.filter((r) => TEST_EMAIL.test(r.email)).map((r) => r.id)
  if (stale.length) {
    console.log(`removing ${stale.length} test account(s) left by an earlier run`)
    await purgeAccounts(stale)
  }
}

async function purgeAccounts(ids) {
  const leftovers = []
  await withDb(async (db) => {
    const { rows } = await db.query('select id, email, magento_customer_id from public.users where id = any($1)', [ids])
    for (const row of rows) {
      if (!TEST_EMAIL.test(row.email)) throw new Error(`refusing to delete ${row.id}: not a test account`)
      if (row.magento_customer_id) leftovers.push(`store customer ${row.magento_customer_id} (${row.email})`)
    }
    await db.query('begin')
    try {
      // Rows that point at a user without ON DELETE CASCADE. A failure here
      // names a new table: add it to this list.
      // Lists only test accounts own (bookmark folders, wishlists, …), and
      // every row pointing at them: deleting a list only nulls those.
      const lists = (await db.query(
        `select distinct j.list_id from public.lists_directus_users j where j.user_id::text = any($1)
         and not exists (select 1 from public.lists_directus_users o where o.list_id = j.list_id and not (o.user_id::text = any($1)))`,
        [ids])).rows.map((r) => r.list_id)
      if (lists.length) {
        const refs = (await db.query(
          `select kcu.table_schema, kcu.table_name, kcu.column_name
           from information_schema.referential_constraints rc
           join information_schema.key_column_usage kcu on kcu.constraint_name = rc.constraint_name and kcu.constraint_schema = rc.constraint_schema
           join information_schema.constraint_column_usage ccu on ccu.constraint_name = rc.unique_constraint_name and ccu.constraint_schema = rc.unique_constraint_schema
           where ccu.table_schema = 'public' and ccu.table_name = 'lists' and ccu.column_name = 'id'`)).rows
        for (const ref of refs) {
          await db.query(`delete from "${ref.table_schema}"."${ref.table_name}" where "${ref.column_name}" = any($1)`, [lists])
        }
        await db.query('delete from public.lists where id = any($1)', [lists])
      }
      await db.query(`delete from licensing.license_installations where user_license_id in
        (select id from licensing.user_licenses where user_id::text = any($1))`, [ids])
      for (const [table, column] of [['licensing.user_licenses', 'user_id'], ['public.customers', 'user_id'],
        ['public.integration_installs', 'user_id'], ['public.lists_directus_users', 'user_id'], ['public.cart', '"user"'],
        ['public.posts', 'creator_id']]) {
        await db.query(`delete from ${table} where ${column}::text = any($1)`, [ids])
      }
      // Per-account play history (layers/social), once its collection exists.
      if ((await db.query("select to_regclass('public.play_history') as t")).rows[0].t) {
        await db.query('delete from public.play_history where user_id = any($1)', [ids])
      }
      // accounts, sessions and profiles go with the user.
      await db.query('delete from public.users where id = any($1)', [ids])
      await db.query('commit')
    } catch (e) {
      await db.query('rollback')
      throw e
    }
  })
  for (const id of ids) leftovers.push(...await purgeElsewhere(id))
  if (leftovers.length) {
    console.error(`\nTest data left behind — remove it by hand:\n  ${leftovers.join('\n  ')}`)
    process.exitCode = 1
  }
}

/** The user's Rocket.Chat user, Novu subscriber and upload folder. */
async function purgeElsewhere(id) {
  const left = []
  const tryStep = async (label, fn) => { try { await fn() } catch (e) { left.push(`${label} for ${id}: ${e.message}`) } }
  const { ROCKETCHAT_URL: rc, ROCKETCHAT_ADMIN_TOKEN: rcToken, ROCKETCHAT_ADMIN_USER_ID: rcUser } = process.env
  if (rc && rcToken && rcUser) await tryStep('Rocket.Chat user', async () => {
    const headers = { 'X-Auth-Token': rcToken, 'X-User-Id': rcUser, 'content-type': 'application/json' }
    const username = `meeovi-${id}`
    const info = await (await fetch(`${rc}/api/v1/users.info?username=${encodeURIComponent(username)}`, { headers })).json()
    if (!info.success) return // never made one
    if (info.user?.username !== username) throw new Error(`lookup returned ${info.user?.username}`)
    const res = await (await fetch(`${rc}/api/v1/users.delete`, { method: 'POST', headers, body: JSON.stringify({ userId: info.user._id, confirmRelinquish: true }) })).json()
    if (!res.success) throw new Error(res.error ?? 'delete refused')
  })
  const { NOVU_API_URL: novu, NOVU_SECRET_KEY: novuKey } = process.env
  if (novu && novuKey) await tryStep('Novu subscriber', async () => {
    const headers = { Authorization: `ApiKey ${novuKey}` }
    const found = await fetch(`${novu}/v1/subscribers/${id}`, { headers })
    if (found.status === 404) return
    if ((await found.json()).data?.subscriberId !== id) throw new Error(`lookup HTTP ${found.status}`)
    const res = await fetch(`${novu}/v1/subscribers/${id}`, { method: 'DELETE', headers })
    if (!res.ok) throw new Error(`delete HTTP ${res.status}`)
  })
  const { NUXT_PIXANOMY_URL: nc, NUXT_PIXANOMY_USERNAME: ncUser, NUXT_PIXANOMY_APP_PASSWORD: ncPass, NUXT_PIXANOMY_ROOT: ncRoot } = process.env
  if (nc && ncUser && ncPass && ncRoot) await tryStep('upload folder', async () => {
    const headers = { Authorization: `Basic ${Buffer.from(`${ncUser}:${ncPass}`).toString('base64')}` }
    const folder = `${nc}/remote.php/dav/files/${encodeURIComponent(ncUser)}/${ncRoot}/${id}/`
    const found = await fetch(folder, { method: 'PROPFIND', headers: { ...headers, Depth: '0' } })
    if (found.status === 404) return
    if (found.status !== 207) throw new Error(`lookup HTTP ${found.status}`)
    const res = await fetch(folder, { method: 'DELETE', headers })
    if (!res.ok) throw new Error(`delete HTTP ${res.status}`)
  })
  return left
}

// ---- results -------------------------------------------------------------
const results = []
export class Blocked extends Error {}
export const blocked = (why) => { throw new Blocked(why) }
export function expect(cond, message) { if (!cond) throw new Error(message) }

/**
 * Form submissions need a Cloudflare Turnstile token
 * (layers/shared/shared/formProtection.ts), which a script can't get: a
 * check that has to get past that gate reports blocked. The gate itself is
 * tested in shared.mjs (FP*).
 */
export const isTurnstileRefusal = (r) => r.status === 403 && r.body?.data?.turnstile === true
export const turnstileGate = (r) => { if (isTurnstileRefusal(r)) blocked('behind Turnstile (form protection) — verify in a browser') }

export async function test(id, name, fn) {
  if (ONLY && !id.startsWith('SETUP') && !`${id} ${name}`.toLowerCase().includes(ONLY.toLowerCase())) return
  const started = Date.now()
  try {
    const note = await fn()
    results.push({ id, name, status: 'pass', note: typeof note === 'string' ? note : '' })
    console.log(`  ✔ ${id} ${name}${typeof note === 'string' && note ? ` — ${note}` : ''}`)
  } catch (e) {
    const status = e instanceof Blocked ? 'blocked' : 'fail'
    results.push({ id, name, status, note: e.message })
    console.log(`  ${status === 'blocked' ? '⊘' : '✘'} ${id} ${name} — ${e.message}`)
  }
  void started
}

export function section(title) { console.log(`\n${title}`) }

export function finish(reportPath) {
  const count = (s) => results.filter(r => r.status === s).length
  console.log(`\n${count('pass')} passed, ${count('fail')} failed, ${count('blocked')} blocked (of ${results.length})${networkRetries ? ` — ${networkRetries} GET(s) retried after a network error` : ''}`)
  // PROD_TEST_REPORT_DIR keeps a run against another copy (e.g. localhost)
  // from overwriting the demo's own reports.
  if (reportPath && process.env.PROD_TEST_REPORT_DIR) reportPath = `${process.env.PROD_TEST_REPORT_DIR.replace(/\/$/, '')}/${reportPath.split('/').pop()}`
  if (reportPath) writeFileSync(reportPath, JSON.stringify({ base: BASE, at: new Date().toISOString(), results }, null, 2))
  process.exitCode = count('fail') ? 1 : 0
}
