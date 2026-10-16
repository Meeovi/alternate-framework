#!/usr/bin/env node
// Creates the Directus collections meeovi-dropshipping stores its data in.
// Idempotent: existing collections/fields are left alone.
//
//   DIRECTUS_URL=… DIRECTUS_ADMIN_TOKEN=… node scripts/setup-directus.mjs
//
// The token needs schema-admin rights (an admin user's static token).
// These collections hold sealed supplier credentials and order data: give
// no Directus role (Public included) access to them — the app reads them
// with its own static token, and the /api/cms proxy refuses them.

const url = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_ADMIN_TOKEN || ''
if (!url || !token) {
  console.error('Set DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN')
  process.exit(1)
}

const api = async (path, init = {}) => {
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body?.errors?.[0]?.message ?? body)}`)
  return body?.data
}

const string = (field, extra = {}) => ({ field, type: 'string', schema: { is_nullable: true, ...extra.schema }, meta: { interface: 'input', ...extra.meta } })
const text = (field) => ({ field, type: 'text', schema: { is_nullable: true }, meta: { interface: 'input-multiline' } })
const integer = (field, extra = {}) => ({ field, type: 'integer', schema: { is_nullable: true, ...extra.schema }, meta: { interface: 'input' } })
const decimal = (field) => ({ field, type: 'decimal', schema: { is_nullable: true, numeric_precision: 12, numeric_scale: 2 }, meta: { interface: 'input' } })
const json = (field) => ({ field, type: 'json', schema: { is_nullable: true }, meta: { interface: 'input-code', special: ['cast-json'] } })
const bool = (field) => ({ field, type: 'boolean', schema: { is_nullable: false, default_value: false }, meta: { interface: 'boolean', special: ['cast-boolean'] } })
const stamp = (field) => ({ field, type: 'timestamp', schema: { is_nullable: true }, meta: { interface: 'datetime' } })
const created = { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], interface: 'datetime', readonly: true, hidden: true } }
const updated = { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], interface: 'datetime', readonly: true, hidden: true } }
const id = { field: 'id', type: 'uuid', schema: { is_primary_key: true }, meta: { special: ['uuid'], hidden: true, readonly: true } }

const COLLECTIONS = {
  dropship_connections: [
    id, string('user_id', { schema: { is_nullable: false, is_indexed: true } }), integer('magento_customer_id'),
    string('provider'), string('label'), text('credentials'), string('status'), text('last_error'),
    bool('auto_confirm_orders'), created, updated,
  ],
  dropship_products: [
    id, string('connection_id', { schema: { is_indexed: true } }), string('user_id', { schema: { is_indexed: true } }),
    integer('magento_customer_id'), string('provider'), string('supplier_product_id'), string('supplier_variant_id'),
    string('sku', { schema: { is_unique: true } }), string('name'), decimal('cost'), decimal('price'), json('markup'),
    integer('stock'), string('status'), text('last_error'), stamp('last_synced'), created, updated,
  ],
  dropship_orders: [
    id, string('connection_id', { schema: { is_indexed: true } }), string('user_id', { schema: { is_indexed: true } }),
    string('provider'), integer('magento_order_id', { schema: { is_indexed: true } }), string('magento_increment_id'),
    json('magento_items'), string('supplier_order_id'), string('status'), string('tracking_number'), text('tracking_url'),
    string('carrier'), integer('attempts'), text('last_error'), created, updated,
  ],
}

const existing = new Set((await api('/collections')).map((c) => c.collection))
for (const [collection, fields] of Object.entries(COLLECTIONS)) {
  if (!existing.has(collection)) {
    await api('/collections', {
      method: 'POST',
      body: JSON.stringify({ collection, meta: { icon: 'local_shipping', hidden: true, note: 'meeovi-dropshipping (server-only)' }, schema: {}, fields: [id] }),
    })
    console.log(`created ${collection}`)
  }
  const have = new Set((await api(`/fields/${collection}`)).map((f) => f.field))
  for (const field of fields) {
    if (have.has(field.field)) continue
    await api(`/fields/${collection}`, { method: 'POST', body: JSON.stringify(field) })
    console.log(`  + ${collection}.${field.field}`)
  }
}
console.log('done')
