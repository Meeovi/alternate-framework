// Production tests for the commerce layer (layers/commerce): storefront and
// account pages, the guest/user cart, the commerce driver, payments and
// shipping endpoints. Nothing here buys, refunds or ships. See lib.mjs.
import { Jar, req, test, section, finish, expect, blocked, loadAccounts } from './lib.mjs'

const accounts = loadAccounts()
if (!accounts.user) throw new Error('QA accounts missing — run auth.mjs first')
const location = (r) => (r.headers.get('location') || '').replace(/^https?:\/\/[^/]+/, '')
const errorTitle = (r) => {
  const title = r.text.match(/<title>([^<]*)/)?.[1] ?? ''
  return /^\s*(500|503)\b|Internal Server Error/i.test(title) ? title : null
}
const signIn = async (account) => {
  const jar = new Jar()
  const r = await req('POST', '/api/auth/sign-in/email', { jar, json: { email: account.email, password: account.password } })
  if (r.status !== 200) throw new Error(`sign-in failed: HTTP ${r.status}`)
  return jar
}
const jars = {}

section('Setup')
let product = null
await test('SETUP', 'QA user signs in; a priced product exists', async () => {
  jars.user = await signIn(accounts.user)
  const r = await req('GET', '/api/cms/items/products?limit=1&fields=id,name,price&filter[price][_nnull]=true&filter[price][_gt]=0')
  product = r.body?.data?.[0] ?? null
  return product ? `product ${product.id} "${product.name}" @ ${product.price}` : 'no priced product — cart tests will be blocked'
})

// ---------------------------------------------------------------------------
section('Storefront pages (public)')
const PUBLIC_PAGES = ['/brands', '/outlets', '/cart', '/checkout', '/compare', '/product/gift-cards', '/product/downloads', '/product/showcases',
  ...(product ? [`/product/${product.id}`] : []), '/departments/28', '/brand/1', '/outlet/1', '/coupon/1', '/incentive/1',
  // Guest-accessible by design: guest checkout lands on /success; tracking is
  // looked up by number (see ACCOUNT_PAGES in layers/commerce/nuxt.config.ts).
  '/success', '/tracking']
await test('S1', 'storefront pages render for a signed-out visitor', async () => {
  const broken = []
  for (const p of PUBLIC_PAGES) {
    const r = await req('GET', p)
    if (r.status >= 500 || r.status === 0 || errorTitle(r)) broken.push(`${p} → ${r.status} ${errorTitle(r) ?? ''}`)
  }
  expect(!broken.length, broken.join('; '))
})

section('Account pages (orders, invoices, transactions…)')
const ACCOUNT_PAGES = ['/orders', '/order/1', '/invoice/1', '/transactions', '/transaction/1', '/shipment/1', '/customer-portal',
  '/wishlist', '/your-friends', '/return', '/promotions']

await test('S2', 'account pages send a signed-out visitor to /login', async () => {
  const open = []
  for (const p of ACCOUNT_PAGES) {
    const r = await req('GET', p)
    if (!([301, 302, 307].includes(r.status) && location(r).startsWith('/login'))) open.push(`${p} (${r.status})`)
  }
  expect(!open.length, `open to signed-out visitors: ${open.join(', ')}`)
})
await test('S3', 'account pages render for a signed-in user', async () => {
  const broken = []
  for (const p of ACCOUNT_PAGES) {
    const r = await req('GET', p, { jar: jars.user })
    if (r.status >= 500 || r.status === 0 || errorTitle(r)) broken.push(`${p} → ${r.status} ${errorTitle(r) ?? ''}`)
  }
  expect(!broken.length, broken.join('; '))
})

// ---------------------------------------------------------------------------
section('Cart (guest and isolation)')
const guest = new Jar(), other = new Jar()
let lineId = null
await test('K1', 'a guest gets an empty cart', async () => {
  const r = await req('GET', '/api/commerce/cart', { jar: guest })
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
})
await test('K2', 'a guest can add an item; the price comes from the server', async () => {
  if (!product) blocked('no priced product')
  // A client-supplied price must be refused outright (strict body schema)…
  const spoof = await req('POST', '/api/commerce/cart/items', { jar: guest, json: { productId: String(product.id), quantity: 1, price: 0.01 } })
  expect(spoof.status === 400, `request with a client price was accepted (HTTP ${spoof.status})`)
  // …and the stored unit price comes from the product.
  const r = await req('POST', '/api/commerce/cart/items', { jar: guest, json: { productId: String(product.id), quantity: 2 } })
  if (r.status === 400 && /unknown|unpriced/i.test(r.text)) blocked(`cart doesn't recognise product ${product.id}: ${r.body?.statusMessage}`)
  expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`)
  const cart = await req('GET', '/api/commerce/cart', { jar: guest })
  const items = cart.body?.items ?? cart.body?.cart?.items ?? []
  expect(items.length, `cart empty after add: ${cart.text.slice(0, 160)}`)
  lineId = items[0].id
  const unit = Number(items[0].unitPrice ?? items[0].unit_price ?? items[0].price ?? NaN)
  expect(!(unit > 0 && unit < 0.5 && Number(product.price) > 0.5), `client-supplied price was used (${unit})`)
  return `line ${lineId}, unit ${unit}`
})
await test('K3', "another visitor can't see or change that cart", async () => {
  if (!lineId) blocked('no cart line')
  const view = await req('GET', '/api/commerce/cart', { jar: other })
  expect(!(view.text.includes(String(lineId)) && view.body?.items?.length), 'other visitor sees the guest cart')
  const r = await req('PATCH', `/api/commerce/cart/items/${lineId}`, { jar: other, json: { quantity: 5 } })
  expect(r.status === 404 || r.status === 403, `PATCH another cart's line → HTTP ${r.status}`)
  const d = await req('DELETE', `/api/commerce/cart/items/${lineId}`, { jar: other })
  expect(d.status === 404 || d.status === 403, `DELETE another cart's line → HTTP ${d.status}`)
})
await test('K4', 'quantity limits are enforced', async () => {
  if (!lineId) blocked('no cart line')
  const r = await req('PATCH', `/api/commerce/cart/items/${lineId}`, { jar: guest, json: { quantity: 100000 } })
  expect(r.status === 400, `HTTP ${r.status}`)
})
await test('K5', 'the guest can update, remove and clear', async () => {
  if (!lineId) blocked('no cart line')
  expect((await req('PATCH', `/api/commerce/cart/items/${lineId}`, { jar: guest, json: { quantity: 1 } })).status === 200, 'PATCH failed')
  expect([200, 204].includes((await req('DELETE', `/api/commerce/cart/items/${lineId}`, { jar: guest })).status), 'DELETE failed')
  expect((await req('POST', '/api/commerce/cart/clear', { jar: guest, json: {} })).status === 200, 'clear failed')
})

// ---------------------------------------------------------------------------
section('Commerce driver (POST /api/commerce/driver)')
const driver = (jar, method, args) => req('POST', '/api/commerce/driver', { jar, json: { method, ...(args ? { args } : {}) } })
await test('D1', 'public catalogue methods work signed out', async () => {
  const r = await driver(null, 'getProducts', [{ pageSize: 1 }])
  expect(r.status < 500, `HTTP ${r.status}: ${r.text.slice(0, 120)}`)
  return `getProducts ${r.status}`
})
await test('D2', 'customer methods need a session', async () => {
  for (const m of ['getCustomer', 'getCustomerAddresses', 'getOrders']) {
    const r = await driver(null, m)
    expect(r.status === 401 || r.status === 403, `${m} → HTTP ${r.status}`)
  }
})
await test('D3', 'methods outside the allow-list are refused', async () => {
  for (const m of ['constructor', '__proto__', 'deleteAllOrders', 'adminUpdateProduct', '']) {
    const r = await driver(jars.user, m)
    expect(r.status === 403 || r.status === 400, `"${m}" → HTTP ${r.status}`)
  }
})

// ---------------------------------------------------------------------------
section('Payments')
await test('P1', 'payment endpoints need a session', async () => {
  const open = []
  for (const [m, p] of [['GET', '/api/payment/methods'], ['POST', '/api/payment/paypal/orders'], ['POST', '/api/payment/paypal/capture'],
    ['POST', '/api/payment/stripe/paymentintent'], ['GET', '/api/download/1'],
    ['POST', '/api/commerce/connect/account'], ['POST', '/api/commerce/connect/product'], ['GET', '/api/commerce/connect/products'],
    ['GET', '/api/commerce/friends/shopping'], ['GET', '/api/shipment/my-shipments'], ['POST', '/api/notifications/commerce']]) {
    const r = await req(m, p, m === 'GET' ? {} : { json: {} })
    if (r.status !== 401 && r.status !== 404 && r.status !== 405) open.push(`${m} ${p} → ${r.status}`)
  }
  expect(!open.length, open.join('; '))
})
await test('P1b', 'checkout-session allows guest checkout but validates the basket', async () => {
  // Guest checkout is intended (getAuthSession is optional there).
  const r = await req('POST', '/api/payment/stripe/checkout-session', { json: {} })
  expect(r.status === 400, `HTTP ${r.status}`)
})
await test('P2', 'Stripe webhook rejects unsigned events', async () => {
  const r = await req('POST', '/api/payment/stripe/webhooks', { json: { type: 'checkout.session.completed', data: { object: {} } } })
  expect(r.status === 400 || r.status === 401, `HTTP ${r.status}`)
})
await test('P3', 'checkout-session status endpoint leaks nothing for a bogus id', async () => {
  const r = await req('GET', '/api/payment/stripe/checkout-session/cs_test_qa_bogus')
  expect(r.status >= 400 && r.status < 500, `HTTP ${r.status}`)
})
await test('P4', 'payment "done" endpoint does not return customer details without a session', async () => {
  const r = await req('GET', '/api/payment/stripe/done?session_id=cs_test_qa_bogus')
  expect(r.status < 500, `HTTP ${r.status}`)
  // Only a bogus id can be probed here; the field must not exist at all.
  expect(!/customer_email|customer_details/.test(r.text), 'response carries customer email fields')
  return `HTTP ${r.status}`
})
await test('P5', 'downloads check order ownership', async () => {
  const r = await req('GET', '/api/download/999999999', { jar: jars.user })
  expect(r.status === 404 || r.status === 403, `HTTP ${r.status}`)
})

// ---------------------------------------------------------------------------
section('Shipping (Shippo)')
await test('SH1', 'label / batch / refund / manifest / webhook-setup refuse callers without the admin secret', async () => {
  const open = []
  for (const p of ['/api/shipment/label', '/api/shipment/batch/purchase', '/api/shipment/refund', '/api/shipment/manifest', '/api/shipment/webhook']) {
    const r = await req('POST', p, { jar: jars.user, json: {} })
    if (![401, 403].includes(r.status)) open.push(`${p} → ${r.status}`)
  }
  expect(!open.length, open.join('; '))
})
await test('SH2', 'tracking webhook rejects a missing/wrong token', async () => {
  const a = await req('POST', '/api/shipment/track-updated', { json: {} })
  const b = await req('POST', '/api/shipment/track-updated?token=wrong', { json: {} })
  expect([401, 500].includes(a.status) && [401, 500].includes(b.status), `HTTP ${a.status}/${b.status}`)
  return a.status === 500 ? 'note: SHIPPO_WEBHOOK_TOKEN not configured (500)' : ''
})
await test('SH3', 'rate quotes are open (informational)', async () => {
  const r = await req('POST', '/api/shipment/rates', { json: {} })
  return `signed-out POST {} → HTTP ${r.status} (open endpoint; validation only)`
})

finish('/home/meebuzo/.meeovi-demo/test-results-commerce.json')
