// Cross-cutting security checks against the deployed app — the basics an
// external scanner (OWASP ZAP & co.) looks at, kept repeatable here:
// transport, headers, exposed files, source maps, CORS, redirects, cookies,
// and the Supabase REST lockdown. Read-only apart from one QA sign-in.
// See lib.mjs; docs/instructions/web-app-security.md §9/§11.
import tls from 'node:tls'
import https from 'node:https'
import { Jar, req, test, section, finish, expect, blocked, loadAccounts, BASE, signInJar } from './lib.mjs'

const host = new URL(BASE).hostname
const accounts = loadAccounts()

section('Transport')
await test('T1', 'plain HTTP redirects to HTTPS', async () => {
  const r = await fetch(`http://${host}/login`, { redirect: 'manual' })
  expect([301, 302, 307, 308].includes(r.status) && (r.headers.get('location') || '').startsWith('https://'), `HTTP ${r.status} → ${r.headers.get('location')}`)
})
await test('T2', 'TLS 1.0 / 1.1 are refused', async () => {
  const tryVersion = (v) => new Promise((resolve) => {
    const s = tls.connect({ host, port: 443, servername: host, minVersion: v, maxVersion: v }, () => { s.end(); resolve(true) })
    s.on('error', () => resolve(false))
    s.setTimeout(8000, () => { s.destroy(); resolve(false) })
  })
  for (const v of ['TLSv1', 'TLSv1.1']) expect(!(await tryVersion(v)), `${v} handshake accepted`)
  expect(await tryVersion('TLSv1.2') || await tryVersion('TLSv1.3'), 'no modern TLS version accepted')
})

section('Headers')
await test('H1', 'security headers on pages', async () => {
  const r = await req('GET', '/login')
  const missing = ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy']
    .filter((n) => !r.headers.get(n))
  expect(!missing.length, `missing: ${missing.join(', ')}`)
  expect(r.headers.get('content-security-policy') || r.headers.get('content-security-policy-report-only'), 'no CSP (enforced or report-only)')
  expect(/max-age=\d{7,}/.test(r.headers.get('strict-transport-security') || ''), 'HSTS max-age under ~4 months')
  return r.headers.get('content-security-policy') ? 'CSP enforced' : 'CSP report-only'
})
await test('H2', 'no server/framework version banners', async () => {
  const r = await req('GET', '/login')
  const leaky = ['x-powered-by', 'x-aspnet-version', 'x-nitro-version'].filter((n) => r.headers.get(n))
  expect(!leaky.length, `sent: ${leaky.join(', ')}`)
})

section('Exposure')
await test('E1', 'source / config files are not served', async () => {
  const open = []
  for (const p of ['/.env', '/.env.production', '/.git/config', '/.git/HEAD', '/package.json', '/nitro.json',
    '/.output/server/index.mjs', '/server/index.mjs', '/nuxt.config.ts', '/.sample.env', '/docker-compose.yml']) {
    const r = await req('GET', p)
    if (r.status === 200 && !/<html/i.test(r.text)) open.push(p)
  }
  expect(!open.length, `served: ${open.join(', ')}`)
})
await test('E2', 'client source maps are not public', async () => {
  const page = await req('GET', '/login')
  const scripts = [...new Set(page.text.match(/\/_nuxt\/[A-Za-z0-9_-]+\.js/g) ?? [])].slice(0, 5)
  if (!scripts.length) blocked('no /_nuxt scripts found on /login')
  const exposed = [], broken = []
  for (const s of scripts) {
    // A HEAD is enough — and a stale asset manifest once served these as a
    // 500 with the deleted file's Content-Length, which broke body reads.
    const r = await fetch(`${BASE}${s}.map`, { method: 'HEAD', redirect: 'manual' })
    if (r.status === 200) exposed.push(`${s}.map`)
    else if (r.status >= 500) broken.push(`${s}.map → ${r.status}`)
  }
  expect(!exposed.length, `public: ${exposed.join(', ')}`)
  expect(!broken.length, `should 404: ${broken.join(', ')}`)
})
await test('E3', 'TRACE is not allowed', async () => {
  // fetch() refuses to send TRACE, so use a raw request.
  const status = await new Promise((resolve) => {
    const r = https.request({ host, path: '/', method: 'TRACE', timeout: 8000 }, (res) => { res.resume(); resolve(res.statusCode) })
    r.on('error', () => resolve(0)); r.on('timeout', () => { r.destroy(); resolve(0) }); r.end()
  })
  expect(status === 0 || status >= 400, `HTTP ${status}`)
  return `HTTP ${status}`
})

section('Cross-origin & redirects')
await test('C1', 'a foreign Origin is never granted CORS on the API', async () => {
  const bad = []
  for (const p of ['/api/auth/get-session', '/api/cms/items/navigation?limit=1&fields=id', '/api/social/feed', '/api/commerce/cart']) {
    const r = await req('GET', p, { headers: { origin: 'https://evil.example' } })
    const acao = r.headers.get('access-control-allow-origin')
    if (acao === '*' || acao === 'https://evil.example') bad.push(`${p} → ACAO ${acao}${r.headers.get('access-control-allow-credentials') ? ' +credentials' : ''}`)
  }
  expect(!bad.length, bad.join('; '))
})
await test('C2', 'auth refuses an off-site callbackURL', async () => {
  const r = await req('POST', '/api/auth/sign-in/email', {
    json: { email: 'nobody@example.invalid', password: 'not-the-password-123', callbackURL: 'https://evil.example/steal' },
  })
  expect(r.status === 403 || r.status === 400, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  return `HTTP ${r.status} ${r.body?.code ?? ''}`
})
await test('C3', 'auth refuses a state-changing request from a foreign Origin', async () => {
  // sign-in is behind Turnstile, which answers first; sign-out isn't, so it
  // reaches better-auth's origin check (a cookie makes the check apply).
  const r = await req('POST', '/api/auth/sign-out', {
    json: {},
    headers: { origin: 'https://evil.example', cookie: '__Secure-custom_session_token=x' },
  })
  expect(r.status === 403 && /origin/i.test(r.text), `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})

section('Session cookies')
await test('K1', 'login cookies are Secure, HttpOnly, SameSite', async () => {
  if (!accounts.user) blocked('QA accounts missing — run auth.mjs first')
  const r = await req('POST', '/api/auth/sign-in/email', { jar: new Jar(), json: { email: accounts.user.email, password: accounts.user.password } })
  if (r.status === 400 && /captcha/i.test(r.text)) blocked('sign-in is behind Turnstile — check the cookie flags in a browser')
  expect(r.status === 200, `sign-in HTTP ${r.status}`)
  const weak = r.setCookies
    .filter((c) => /session|token/i.test(c.split('=')[0]))
    .filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c) || !/;\s*samesite=(lax|strict)/i.test(c))
    .map((c) => c.split('=')[0])
  expect(!weak.length, `weak flags on: ${weak.join(', ')}`)
})

section('Privacy (GDPR access / portability)')
await test('P1', 'data export needs a session', async () => {
  const r = await req('GET', '/api/account/export')
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('P2', "data export returns the caller's own data and no secrets", async () => {
  if (!accounts.user) blocked('QA accounts missing — run auth.mjs first')
  const jar = await signInJar(accounts.user)
  const r = await req('GET', '/api/account/export', { jar })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  expect(r.body?.account?.id === accounts.user.id, 'export is not for the signed-in user')
  expect(/attachment/.test(r.headers.get('content-disposition') || ''), 'not served as a download')
  const leaked = [...new Set(r.text.match(/"[a-z_]*(password|token|secret|backup_codes|public_key)[a-z_]*"\s*:/gi) ?? [])]
  expect(!leaked.length, `secret-looking keys: ${leaked.join(', ')}`)
  const unreadable = Object.entries(r.body?.content ?? {}).filter(([, v]) => !Array.isArray(v)).map(([k]) => k)
  return unreadable.length ? `note: CMS collections not read: ${unreadable.join(', ')}` : `${Object.keys(r.body.content).length} CMS collections`
})

await test('P3', 'no analytics / ad scripts in the page before consent', async () => {
  // Loaded client-side only after the cookie banner's opt-in
  // (shared/app/plugins/cookie-consent.client.ts). Browser-side behaviour
  // still needs a manual check: nothing from these hosts until "Accept".
  const r = await req('GET', '/')
  const found = ['pagead2.googlesyndication.com', 'googletagmanager.com/gtm.js', 'googletagmanager.com/gtag/js',
    'bat.bing.com', 'connect.facebook.net', 'analytics.tiktok.com', 'sc-static.net', 'redditstatic.com', 'static.ads-twitter.com']
    .filter((host) => new RegExp(`<script[^>]+src="[^"]*${host.replace(/\./g, '\\.')}`).test(r.text))
  expect(!found.length, `loaded without consent: ${found.join(', ')}`)
})

section('Database API (Supabase REST)')
await test('D1', 'the public schema is closed to the anon key', async () => {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_KEY
  if (!url || !key) blocked('SUPABASE_URL / SUPABASE_KEY not in env')
  const open = []
  // Count-only HEAD requests — never reads a row.
  for (const t of ['sessions', 'users', 'accounts', 'contacts', 'orders', 'os_invoices', 'audit_log_entries']) {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${t}?select=id`, {
      method: 'HEAD',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'accept-profile': 'public', prefer: 'count=exact' },
    })
    if (r.ok) open.push(`${t} (${r.headers.get('content-range')})`)
  }
  expect(!open.length, `readable with the anon key: ${open.join(', ')}`)
})

finish('/home/meebuzo/.meeovi-demo/test-results-security.json')
