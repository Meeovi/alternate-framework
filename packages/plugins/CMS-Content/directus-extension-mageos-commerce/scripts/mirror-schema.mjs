#!/usr/bin/env node
// Adds the fields the Mage-OS mirror writes to Directus's `products` collection.
// Safe to run again: fields that already exist are left as they are.
//
//   DIRECTUS_URL=https://cms.example.com DIRECTUS_ADMIN_TOKEN=… node scripts/mirror-schema.mjs [--dry-run]
//
// Needs an admin token (schema changes). Every field is nullable and only the
// sync fills it, so existing Directus-only products are untouched.

const url = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '')
const token = process.env.DIRECTUS_ADMIN_TOKEN
const dryRun = process.argv.includes('--dry-run')
if (!url || !token) {
  console.error('Set DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN')
  process.exit(1)
}

const note = (text) => `${text} Set by the Mage-OS sync for store products (source = magento).`
const string = (field, text, extra = {}) => ({ field, type: 'string', meta: { interface: 'input', width: 'half', note: note(text) }, schema: { is_nullable: true, ...extra } })
const longText = (field, text, html = false) => ({ field, type: 'text', meta: { interface: html ? 'input-rich-text-html' : 'input-multiline', note: note(text) }, schema: { is_nullable: true } })
const json = (field, text) => ({ field, type: 'json', meta: { interface: 'input-code', options: { language: 'JSON' }, special: ['cast-json'], note: note(text) }, schema: { is_nullable: true } })

/** The products fields productRow() (src/mirror/rows.ts) writes, beyond the ones the collection already had. */
const PRODUCT_FIELDS = [
  string('slug', "The store's URL key, e.g. habit-tracker.", { is_indexed: true }),
  string('type', 'simple, configurable, virtual, bundle, downloadable or giftcard.'),
  { field: 'regular_price', type: 'decimal', meta: { interface: 'input', width: 'half', note: note('Price before any special price; `price` is what the buyer pays.') }, schema: { is_nullable: true, numeric_precision: 12, numeric_scale: 4 } },
  string('currency_code', 'ISO currency of the prices, e.g. USD.', { max_length: 3 }),
  { field: 'in_stock', type: 'boolean', meta: { interface: 'boolean', special: ['cast-boolean'], width: 'half', note: note('Whether the store sells it now.') }, schema: { is_nullable: true } },
  longText('short_description', 'Short description (HTML).', true),
  string('meta_title', 'SEO title.'),
  longText('meta_description', 'SEO description.'),
  { field: 'image_url', type: 'text', meta: { interface: 'input', note: note('Main image URL (the first of gallery).') }, schema: { is_nullable: true } },
  json('gallery', 'Every image URL, in the store\'s order.'),
  json('options', 'Configurable options: [{ code, label, values: [{ id, label, swatch? }] }].'),
  json('variants', 'Configurable variants: [{ id, sku, inStock, price, options: { code: valueId } }].'),
  json('mageos_attributes', 'The store\'s other product attributes, by attribute code.'),
]

async function api(path, init = {}) {
  const res = await fetch(`${url}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: HTTP ${res.status} ${JSON.stringify(body?.errors?.[0]?.message ?? body)}`)
  return body?.data
}

const existing = new Set((await api('/fields/products')).map((f) => f.field))
for (const definition of PRODUCT_FIELDS) {
  if (existing.has(definition.field)) {
    console.log(`  = products.${definition.field} (already there)`)
    continue
  }
  if (!dryRun) await api('/fields/products', { method: 'POST', body: JSON.stringify(definition) })
  console.log(`  + products.${definition.field}${dryRun ? ' (dry run)' : ''}`)
}
