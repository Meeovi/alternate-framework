// Production tests for the business layer (layers/business): the /workspace
// pages, the legacy redirects and POST /api/business/driver. See lib.mjs.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { Jar, req, test, section, finish, expect, blocked, loadAccounts, repoRoot } from './lib.mjs'

const layer = join(repoRoot, 'layers/business')
const accounts = loadAccounts()
if (!accounts.user || !accounts.seller) throw new Error('QA accounts missing — run auth.mjs first')

// ---- page list, straight from the layer so it stays in sync --------------
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : name.endsWith('.vue') ? [full] : []
  })
}
const pagesDir = join(layer, 'app/pages')
const pages = walk(pagesDir).sort().map((file) => {
  const source = readFileSync(file, 'utf8')
  const middleware = (source.match(/middleware:\s*(\[[^\]]*\]|'[^']*'|"[^"]*")/)?.[1] ?? '').replace(/["'[\]\s]/g, '')
  const route = '/' + relative(pagesDir, file).replace(/\.vue$/, '').replace(/(^|\/)index$/, '')
    .replace(/\[\.\.\.[^\]]+\]|\[[^\]]+\]/g, '1') // sample value for dynamic segments
  return { route, file: relative(repoRoot, file), middleware: middleware || 'none' }
})
// The layer's pages:extend hook role-gates /workspace pages from the tables
// they render — run the real hook so the expected roles stay in sync.
{
  const config = (await import(join(layer, 'nuxt.config.ts'))).default
  const fake = pages.map((p) => ({ file: join(repoRoot, p.file) }))
  config.hooks['pages:extend'](fake)
  pages.forEach((p, i) => {
    p.roles = fake[i].meta?.roles ?? null
  })
}

// ---- legacy redirects, straight from nuxt.config.ts ----------------------
const config = readFileSync(join(layer, 'nuxt.config.ts'), 'utf8')
const redirects = [...config.matchAll(/'([^']+)':\s*\{\s*redirect:\s*'([^']+)'\s*\}/g)]
  .map(([, from, to]) => ({ from: from.replace('/**', '/x'), to: to.replace('/**', '/x') }))

const signIn = async (account) => {
  const jar = new Jar()
  const r = await req('POST', '/api/auth/sign-in/email', { jar, json: { email: account.email, password: account.password } })
  if (r.status !== 200) throw new Error(`sign-in failed for ${account.username}: HTTP ${r.status}`)
  return jar
}
const location = (r) => (r.headers.get('location') || '').replace(/^https?:\/\/[^/]+/, '')
const isLoginRedirect = (r) => [301, 302, 307].includes(r.status) && location(r).startsWith('/login')
const errorPage = (r) => {
  const title = r.text.match(/<title>([^<]*)/)?.[1] ?? ''
  return /^\s*(500|404|503)\b|Internal Server Error|Page not found/i.test(title) ? title : null
}

async function pool(items, size, fn) {
  const out = []; let i = 0
  // A request that still fails after retries becomes a status-0 result
  // (reported by the tests) instead of crashing the run.
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) {
      const k = i++
      try { out[k] = await fn(items[k]) } catch (e) { out[k] = { status: 0, headers: new Headers(), text: String(e?.cause?.code || e.message), r: { status: 0, headers: new Headers(), text: String(e?.cause?.code || e.message) }, ms: 0 } }
    }
  }))
  return out
}

// ---------------------------------------------------------------------------
section('Setup')
const jars = {}
await test('SETUP', 'QA user and seller can sign in', async () => {
  jars.user = await signIn(accounts.user)
  jars.seller = await signIn(accounts.seller)
})

// ---------------------------------------------------------------------------
section(`Workspace pages (${pages.length}) — signed out`)
const anon = await pool(pages, 3, (p) => req('GET', p.route))
await test('W1', 'every workspace page sends a signed-out visitor to /login', async () => {
  const open = pages.filter((p, i) => !isLoginRedirect(anon[i]))
  expect(!open.length, `${open.length} open to signed-out visitors: ${open.map((p, i) => `${p.route} [${p.middleware}]`).join(', ')}`)
})
await test('W2', 'no workspace page errors for a signed-out visitor', async () => {
  const broken = pages.map((p, i) => [p, anon[i]]).filter(([, r]) => r.status === 0 || r.status >= 500 || errorPage(r))
  expect(!broken.length, broken.map(([p, r]) => `${p.route} → ${r.status} ${errorPage(r) ?? ''}`).join('; '))
})

for (const who of ['user', 'seller']) {
  section(`Workspace pages — signed in as qa${who}`)
  const started = Date.now()
  const results = await pool(pages, 3, async (p) => {
    const t = Date.now()
    const r = await req('GET', p.route, { jar: jars[who] })
    return { r, ms: Date.now() - t }
  })
  await test(`W3-${who}`, `no workspace page errors (qa${who})`, async () => {
    const broken = pages.map((p, i) => [p, results[i].r]).filter(([, r]) => r.status === 0 || r.status >= 500 || errorPage(r))
    expect(!broken.length, broken.map(([p, r]) => `${p.route} → ${r.status} ${errorPage(r) ?? ''}`).join('; '))
    const slow = pages.map((p, i) => [p, results[i].ms]).filter(([, ms]) => ms > 8000)
    return `${pages.length} pages in ${Math.round((Date.now() - started) / 1000)}s` + (slow.length ? `; slow (>8s): ${slow.map(([p, ms]) => `${p.route} ${Math.round(ms / 1000)}s`).join(', ')}` : '')
  })
  await test(`W4-${who}`, `no signed-in qa${who} is bounced to /login`, async () => {
    const bounced = pages.filter((p, i) => isLoginRedirect(results[i].r))
    expect(!bounced.length, bounced.map(p => p.route).join(', '))
  })
  if (who === 'user') {
    await test('W5', 'seller-only pages send a non-seller back to /workspace', async () => {
      const sellerPages = pages.filter(p => p.middleware.includes('seller'))
      const leaked = sellerPages.filter((p) => results[pages.indexOf(p)].r.status === 200)
      expect(!leaked.length, leaked.map(p => p.route).join(', '))
      // Admin-only pages (from their tables' roles) must not render for a plain user.
      const adminPages = pages.filter(p => p.roles && !p.roles.includes('user'))
      const adminLeaked = adminPages.filter((p) => results[pages.indexOf(p)].r.status === 200)
      expect(!adminLeaked.length, `role-gated pages open to qauser: ${adminLeaked.map(p => `${p.route} [${p.roles}]`).join(', ')}`)
      // Pages that show seller data but only require a login, for the report.
      const sellerish = pages.filter((p, i) => !p.middleware.includes('seller') && !p.roles && /\/(sales|catalog|customers|stores|marketing|system|reports)\//.test(p.route) && results[i].r.status === 200)
      return sellerish.length ? `note: ${sellerish.length} seller-area pages open to non-sellers (data still gated by APIs): ${sellerish.map(p => p.route).join(', ')}` : ''
    })
  }
}

// ---------------------------------------------------------------------------
section(`Legacy redirects (${redirects.length})`)
await test('RD1', 'every legacy URL redirects to its workspace page', async () => {
  const wrong = []
  for (const { from, to } of redirects) {
    const r = await req('GET', from, { jar: jars.seller })
    if (![301, 302, 307, 308].includes(r.status) || location(r) !== to) wrong.push(`${from} → ${r.status} ${location(r)} (expected ${to})`)
  }
  expect(!wrong.length, wrong.join('; '))
})
await test('RD2', 'every redirect target is a real page', async () => {
  // Wildcard rules ('/settings/**') map to a made-up sample path — only check exact targets.
  const targets = [...new Set(redirects.filter(r => !r.to.endsWith('/x')).map(r => r.to))]
  const missing = []
  for (const to of targets) {
    const r = await req('GET', to, { jar: jars.seller })
    // The app's catch-all CMS page answers unknown paths with a blank
    // "Page - <site>" instead of a 404 — count that as missing too.
    const title = r.text.match(/<title>([^<]*)/)?.[1] ?? ''
    if (r.status === 404 || /^\s*404\b|Page not found|^\s*Page\s*-/i.test(title)) missing.push(`${to} (${r.status} "${title}")`)
  }
  expect(!missing.length, `targets that don't exist: ${missing.join(', ')}`)
})

// ---------------------------------------------------------------------------
section('Business driver API (POST /api/business/driver)')
const driver = (jar, method, args) => req('POST', '/api/business/driver', { jar, json: { method, ...(args ? { args } : {}) } })
const READS = ['getStats', 'products.list', 'orders.list', 'invoices.list', 'reviews.list', 'shipments.list', 'spaces.list',
  'attributes.list', 'integrations.list', 'shop.get', 'lowStock.list', 'transactions.list', 'payouts.list', 'coupons.list',
  'featuredProducts.list', 'announcements.list']

await test('D1', 'signed-out caller is refused', async () => {
  const r = await driver(null, 'getStats')
  expect(r.status === 401, `HTTP ${r.status}`)
})
await test('D2', 'non-seller is refused (reads and writes)', async () => {
  for (const m of ['getStats', 'orders.list', 'shop.update', 'payouts.request']) {
    const r = await driver(jars.user, m, [{}])
    expect(r.status === 403, `${m} → HTTP ${r.status}`)
  }
})
await test('D3', 'methods outside the allow-list are refused', async () => {
  for (const m of ['shop.delete', 'constructor', '__proto__', 'products.constructor', 'products.list.call', 'toString', '']) {
    const r = await driver(jars.seller, m)
    expect(r.status === 403 || r.status === 400, `"${m}" → HTTP ${r.status}`)
  }
})
await test('D4', 'malformed bodies are refused', async () => {
  const noMethod = await req('POST', '/api/business/driver', { jar: jars.seller, json: { args: [] } })
  expect(noMethod.status === 400, `no method → HTTP ${noMethod.status}`)
  const badArgs = await req('POST', '/api/business/driver', { jar: jars.seller, json: { method: 'getStats', args: 'x' } })
  expect(badArgs.status === 400, `args not an array → HTTP ${badArgs.status}`)
})
const readResults = {}
await test('D5', 'every read method answers a seller without a server error', async () => {
  const broken = []
  for (const m of READS) {
    const r = await driver(jars.seller, m, [{}])
    readResults[m] = r
    if (r.status >= 500) broken.push(`${m} → ${r.status} ${r.body?.statusMessage ?? r.body?.message ?? ''}`.trim())
  }
  const summary = READS.map(m => `${m} ${readResults[m].status}`).join(', ')
  expect(!broken.length, `${broken.join('; ')} | all: ${summary}`)
  return summary
})
await test('D6', "a seller can't read another seller's data by passing sellerId", async () => {
  const own = readResults['orders.list'] ?? await driver(jars.seller, 'orders.list', [{}])
  if (own.status !== 200) blocked(`orders.list → HTTP ${own.status}, can't compare`)
  const spoofed = await driver(jars.seller, 'orders.list', [{ sellerId: accounts.user.id }])
  expect(spoofed.status === own.status && spoofed.text === own.text, 'response changed when another sellerId was supplied')
})
await test('D7', 'write methods are not exercised for sellers', async () => {
  blocked('shop.update / payouts.request change real shop data / request a real payout — only the non-seller refusal (D2) is tested')
})

finish('/home/meebuzo/.meeovi-demo/test-results-business.json')
