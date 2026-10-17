// Production tests for the ui-shell layer (layers/ui-shell): app chrome,
// layouts, PWA files and caching, error handling. See lib.mjs.
import { Jar, req, test, section, finish, expect, loadAccounts, signInJar } from './lib.mjs'

const accounts = loadAccounts()
const errorTitle = (r) => /^\s*(500|503)\b|Internal Server Error/i.test(r.text.match(/<title>([^<]*)/)?.[1] ?? '')

section('Pages and layouts')
await test('UI1', 'homepage renders with the app shell', async () => {
  const r = await req('GET', '/')
  expect(r.status === 200 && !errorTitle(r), `HTTP ${r.status}`)
  expect(/<title>[^<]+<\/title>/.test(r.text), 'no <title>')
  expect(/id="__nuxt"/.test(r.text), 'no Nuxt root')
})
await test('UI2', 'homepage is served from the page cache after the first hit', async () => {
  await req('GET', '/')
  const t = Date.now(); const r = await req('GET', '/'); const ms = Date.now() - t
  expect(r.status === 200 && ms < 2000, `took ${ms}ms`)
  return `${ms}ms`
})
await test('UI3', 'an unknown URL answers 404, not a blank 200 page', async () => {
  const r = await req('GET', '/qa-this-page-does-not-exist-12345')
  expect(r.status === 404, `HTTP ${r.status} "${r.text.match(/<title>([^<]*)/)?.[1] ?? ''}" — soft 404 (search engines index it, broken links look fine)`)
  const real = await req('GET', '/about-us')
  expect(real.status === 200, `a real CMS page (/about-us) → HTTP ${real.status}`)
})
await test('UI3b', 'an unknown /api URL answers a JSON 404, not the HTML app', async () => {
  for (const p of ['/api/qa-does-not-exist', '/api/social/qa-does-not-exist/1']) {
    const r = await req('GET', p)
    expect(r.status === 404 && !/<html/i.test(r.text), `${p} → HTTP ${r.status} ${r.headers.get('content-type')}`)
  }
})
await test('UI4', 'workspace layout renders for a signed-in user', async () => {
  if (!accounts.user) return 'skipped (no QA accounts)'
  const jar = await signInJar(accounts.user)
  const r = await req('GET', '/workspace', { jar })
  expect(r.status === 200 && !errorTitle(r), `HTTP ${r.status}`)
})

section('PWA')
await test('PWA1', 'service worker is served and never cached', async () => {
  const r = await req('GET', '/sw.js')
  expect(r.status === 200, `HTTP ${r.status}`)
  expect(/no-store|no-cache/i.test(r.headers.get('cache-control') || ''), `cache-control: ${r.headers.get('cache-control')}`)
  expect(r.headers.get('cf-cache-status') !== 'HIT', 'served from Cloudflare cache')
  expect(!/revision:null[^}]*_nuxt\/[A-Za-z0-9_-]+\.js/.test(r.text), 'precaches /_nuxt chunks with revision:null')
})
await test('PWA2', 'web manifest is served and never cached', async () => {
  const r = await req('GET', '/manifest.webmanifest')
  expect(r.status === 200, `HTTP ${r.status}`)
  const m = JSON.parse(r.text)
  expect(m.name && m.icons?.length, 'manifest missing name/icons')
  expect(/no-store|no-cache/i.test(r.headers.get('cache-control') || ''), `cache-control: ${r.headers.get('cache-control')}`)
  return `"${m.name}", ${m.icons.length} icons`
})
await test('PWA3', 'pages no longer emit prefetch hints (Cloudflare Speed Brain)', async () => {
  const r = await req('GET', '/')
  const n = (r.text.match(/<link rel="prefetch"/g) || []).length
  expect(n === 0, `${n} prefetch links`)
})
await test('PWA4', 'hashed assets are cacheable long-term', async () => {
  const home = await req('GET', '/')
  const asset = home.text.match(/\/_nuxt\/[A-Za-z0-9_-]+\.js/)?.[0]
  expect(asset, 'no /_nuxt asset on the homepage')
  const r = await req('GET', asset)
  expect(r.status === 200 && /max-age=\d{6,}|immutable/.test(r.headers.get('cache-control') || ''), `cache-control: ${r.headers.get('cache-control')}`)
})

finish('/home/meebuzo/.meeovi-demo/test-results-ui-shell.json')
