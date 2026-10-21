// Tiny dependency-free runner for production tests against a deployed app
// (default https://demo.meeovicms.com). One file per layer imports this.
//
//   node --env-file=apps/ecosystem/meeovi-frontend/.env \
//     packages/plugins/Scripts/prod-tests/auth.mjs [--only=<substring>]
//
// Env: PROD_TEST_BASE_URL (default https://demo.meeovicms.com),
//      PROD_TEST_ACCOUNTS (default /home/meebuzo/.meeovi-demo/qa-accounts.json),
//      NUXT_DATABASE_URL / BETTER_AUTH_SECRET (from the app .env) for DB checks.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = resolve(here, '../../../..')
export const requireFromRepo = createRequire(resolve(repoRoot, 'package.json'))

export const BASE = (process.env.PROD_TEST_BASE_URL || 'https://demo.meeovicms.com').replace(/\/$/, '')
export const ACCOUNTS_FILE = process.env.PROD_TEST_ACCOUNTS || '/home/meebuzo/.meeovi-demo/qa-accounts.json'
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
 * A signed-in cookie jar for a QA account. Password sign-in is behind
 * Turnstile on the demo, which scripts can't solve, so this opens the
 * session the way better-auth does: a `sessions` row plus the session
 * cookie (`<token>.<base64 HMAC-SHA256(token, BETTER_AUTH_SECRET)>`).
 * Signing out (POST /api/auth/sign-out with the jar) deletes the row.
 */
export async function signInJar(account) {
  if (!account?.id) throw new Blocked('QA account missing')
  const exists = await withDb((db) => db.query('select 1 from users where id = $1', [account.id]))
  if (!exists.rowCount) throw new Blocked(`QA account ${account.username} no longer exists`)
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET not in env — cannot open a test session')
  const { createHmac, randomBytes, randomUUID } = await import('node:crypto')
  const token = randomBytes(24).toString('base64url')
  await withDb((db) => db.query(
    `insert into sessions (id, user_id, token, expires_at, created_at, updated_at, ip_address, user_agent)
     values ($1, $2, $3, now() + interval '2 hours', now(), now(), '127.0.0.1', 'meeovi-prod-tests')`,
    [randomUUID(), account.id, token],
  ))
  const signature = createHmac('sha256', secret).update(token).digest('base64')
  const name = `${BASE.startsWith('https://') ? '__Secure-' : ''}custom_session_token`
  const jar = new Jar()
  jar.cookies.set(name, encodeURIComponent(`${token}.${signature}`))
  return jar
}

export function loadAccounts() {
  return existsSync(ACCOUNTS_FILE) ? JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')) : {}
}
export function saveAccounts(accounts) {
  writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2))
  chmodSync(ACCOUNTS_FILE, 0o600)
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
  if (reportPath) writeFileSync(reportPath, JSON.stringify({ base: BASE, at: new Date().toISOString(), results }, null, 2))
  process.exitCode = count('fail') ? 1 : 0
}
