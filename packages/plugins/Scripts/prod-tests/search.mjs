// Production tests for the search layer (layers/search): /api/search,
// facet values, OpenSearch description, the /search and /results pages.
import { Jar, req, test, section, finish, expect, createTestAccounts, deleteTestAccounts } from './lib.mjs'

// A test user, so the leak checks have a private email to find.
await createTestAccounts(['user'])
// Things that must never come back from a public search.
const LEAKS = [/resend\.dev/i, /\$2[aby]\$\d\d\$/, /\$argon2/i, /"encrypted_password"\s*:\s*"[^"]/i, /"password"\s*:\s*"[^"]/i]
const leaked = (text) => LEAKS.filter(re => re.test(text)).map(String)
const search = (params) => req('POST', '/api/search', { json: params })

section('Search API')
await test('Q1', 'a basic search returns results', async () => {
  const r = await req('GET', '/api/search?q=shirt')
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  const hits = r.body?.hits ?? r.body?.results ?? r.body?.items ?? []
  return `${Array.isArray(hits) ? hits.length : '?'} hit(s); keys: ${Object.keys(r.body ?? {}).join(',')}`
})
await test('Q2', 'page size is capped', async () => {
  const r = await req('GET', '/api/search?q=a&pageSize=10000')
  expect(r.status === 200, `HTTP ${r.status}`)
  const hits = r.body?.hits ?? r.body?.results ?? r.body?.items ?? []
  expect(!Array.isArray(hits) || hits.length <= 96, `${hits.length} hits returned`)
})
await test('Q3', 'injection-style queries are handled', async () => {
  const bad = []
  for (const q of ["' OR 1=1 --", '"; DROP TABLE products; --', '%', '\\', '*:*', '{"$gt":""}', 'a'.repeat(5000), '<script>alert(1)</script>']) {
    const r = await req('GET', `/api/search?q=${encodeURIComponent(q)}`)
    if (r.status >= 500 || r.status === 0) bad.push(`${JSON.stringify(q.slice(0, 20))} → ${r.status}`)
  }
  expect(!bad.length, bad.join('; '))
})
await test('Q4', 'asking for sensitive fields/facets/sort returns nothing sensitive', async () => {
  const sensitive = ['email', 'password', 'encrypted_password', 'token', 'auth_role']
  const r = await search({ q: 'qa', fields: sensitive, facets: sensitive, sort: { field: 'encrypted_password', direction: 'asc' } })
  expect(r.status < 500, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  const found = leaked(r.text)
  expect(!found.length, `response matched ${found.join(', ')}`)
  return `HTTP ${r.status}`
})
await test('Q5', 'facet values for an arbitrary field leak nothing', async () => {
  for (const facetName of ['email', 'encrypted_password', 'customer_email']) {
    const r = await req('POST', '/api/search/facet-values', { json: { facetName, facetQuery: '' } })
    expect(r.status < 500, `${facetName} → HTTP ${r.status}`)
    const found = leaked(r.text)
    expect(!found.length, `${facetName}: ${found.join(', ')}`)
  }
})
await test('Q6', 'malformed facet request is a 400', async () => {
  const r = await req('POST', '/api/search/facet-values', { json: {} })
  expect(r.status === 400, `HTTP ${r.status}`)
})

section('Search pages')
await test('SP1', '/search and /results render', async () => {
  for (const p of ['/search', '/results?q=shirt']) {
    const r = await req('GET', p)
    expect(r.status === 200, `${p} → HTTP ${r.status}`)
  }
})
await test('SP2', 'the search term is not echoed back as live HTML', async () => {
  const payload = '<script>alert("qa-xss")</script>'
  for (const p of [`/search?q=${encodeURIComponent(payload)}`, `/results?q=${encodeURIComponent(payload)}`]) {
    const r = await req('GET', p)
    expect(!r.text.includes(payload), `${p.split('?')[0]} reflects the raw <script>`)
  }
})
await test('SP3', 'OpenSearch description is served', async () => {
  const r = await req('GET', '/opensearch.xml')
  expect(r.status === 200 && /OpenSearchDescription/.test(r.text), `HTTP ${r.status}`)
  expect(!/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(r.text), 'points at a local URL')
})
// The per-layer notification routes were removed (Novu is the only
// notification system); make sure they stay gone.
await test('SP4', 'the old search notifications route stays removed', async () => {
  const r = await req('POST', '/api/notifications/search', { json: {} })
  expect(r.status === 404 || r.status === 405, `HTTP ${r.status}`)
})

await deleteTestAccounts()
finish('/home/meebuzo/.meeovi-demo/test-results-search.json')
