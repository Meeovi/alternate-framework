// CommonJS runner (use .cjs so Node runs it under CommonJS even if package is ESM)
const { normalizeProduct, normalizeCart, normalizeCustomer } = require('./smoke/normalizers.cjs')

console.log('Running nuxt-magento smoke-runner (no installs, CommonJS)...')

const sampleProduct = {
  id: 1,
  sku: 'SKU-001',
  name: 'Smoke Product',
  type_id: 'simple',
  price_range: { minimum_price: { regular_price: { value: 12.5 } } },
  media_gallery_entries: [{ file: '/img1.jpg' }],
  custom_attributes: [{ attribute_code: 'description', value: 'A product' }]
}

const sampleCart = {
  id: 'cart-1',
  items: [
    { id: '100', product: { sku: 'SKU-001', name: 'Smoke Product' }, quantity: 2, prices: { price: { value: 12.5 } } }
  ]
}

const sampleCustomer = { id: 42, email: 'me@example.com', firstname: 'Me', lastname: 'User' }

try {
  const p = normalizeProduct(sampleProduct)
  console.log('\nProduct normalized:')
  console.log(JSON.stringify(p, null, 2))

  const c = normalizeCart(sampleCart)
  console.log('\nCart normalized:')
  console.log(JSON.stringify(c, null, 2))

  const u = normalizeCustomer(sampleCustomer)
  console.log('\nCustomer normalized:')
  console.log(JSON.stringify(u, null, 2))

  console.log('\nSmoke-runner completed successfully.')
  process.exit(0)
} catch (err) {
  console.error('Smoke-runner failed:', err)
  process.exit(2)
}
