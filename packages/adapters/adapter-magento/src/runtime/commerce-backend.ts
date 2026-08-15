import type { CommerceBackendAdapter, DirectusRequestDescriptor } from 'alternate-sdk'
import type { MagentoAdapter } from '@mframework/adapter-magento'
// Self-referencing package import, not a relative path — nuxt-module-build
// only compiles module.ts and runtime/** into dist/, so a relative
// '../normalizers/normalizers' import would resolve to a dist/normalizers/
// that's never generated (see the exports["./normalizers"] entry in
// package.json, which points at the TS source directly, same as ".").
import { magentoNormalizers } from '@mframework/adapter-magento/normalizers'

// Field lists are shaped to match exactly what each magentoNormalizers
// entry actually reads (see normalizers/products.ts, category.ts) — nested
// selections use the { field: [...subfields] } form MagentoAdapter's
// parseFieldsToQuery expects.
const PRODUCT_FIELDS = [
  'id', 'uid', 'sku', 'name', 'status', 'stock_status',
  { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] },
  { description: ['html'] },
  { short_description: ['html'] },
  { small_image: ['url'] },
  { image: ['url'] },
  { media_gallery: ['url'] },
]

const CATEGORY_FIELDS = ['uid', 'name', 'url_key', 'description', 'meta_title', 'image', 'position']

// Real Magento's storefront schema exposes products/categories as
// paginated, search-style root fields (`products(filter/search/pageSize)`,
// `categories(filters/pageSize)`), each returning `{ items, total_count }`
// — not the singular per-entity fields MagentoAdapter.store.readEntity's
// candidate matching assumes. queryField() below calls the real field
// names directly with their real (and differently-named: filter vs
// filters) argument shapes.

async function fetchProducts(magento: MagentoAdapter, key?: string | number) {
  // Real Magento requires either `search` or `filter` on the products
  // field — there's no "list everything" mode. `search: ''` is confirmed
  // (against the live schema) to satisfy that requirement and return
  // every product; a key does an exact-sku lookup instead. Arbitrary
  // Directus-style filter objects aren't translated to Magento's per-field
  // operator shape (eq/like/in/...) — that's a documented gap.
  const args = key
    ? { filter: { sku: { eq: String(key) } } }
    : { search: '' }

  const result = await magento.store.queryField('products', {
    ...args,
    pageSize: 50,
  }, { fields: [{ items: PRODUCT_FIELDS }, 'total_count'] })

  return (result?.items ?? []).map((item: any) => magentoNormalizers.products(item))
}

async function fetchCategories(magento: MagentoAdapter, key?: string | number) {
  const filters = key ? { ids: { eq: String(key) } } : undefined

  const result = await magento.store.queryField('categories', {
    ...(filters ? { filters } : {}),
    pageSize: 50,
  }, { fields: [{ items: CATEGORY_FIELDS }, 'total_count'] })

  return (result?.items ?? []).map((item: any) => magentoNormalizers.categories(item))
}

export function createMagentoCommerceBackendAdapter(magento: MagentoAdapter): CommerceBackendAdapter {
  return {
    id: 'magento',
    collections: ['products', 'categories', 'departments', 'orders'],
    isEnabled: () => true,
    async request({ collection, key }: DirectusRequestDescriptor) {
      switch (collection) {
        case 'products': {
          const items = await fetchProducts(magento, key)
          return key ? (items[0] ?? null) : items
        }
        case 'categories':
        case 'departments': {
          // Directus's category-tree entity — maps onto the same Magento
          // Category type as `categories`.
          const items = await fetchCategories(magento, key)
          return key ? (items[0] ?? null) : items
        }
        case 'orders':
          // Known gap: real Magento has no root-level orders/Order query —
          // order history only exists nested under an authenticated
          // customer (`customer { orders { items { ... } } }`), which needs
          // a per-request customer token this facade doesn't carry today.
          // Returns empty rather than throwing, so callers degrade
          // gracefully instead of the whole request failing.
          return key ? null : []
        default:
          throw new Error(`magento commerce-backend adapter: unmapped collection "${collection}"`)
      }
    },
  }
}
