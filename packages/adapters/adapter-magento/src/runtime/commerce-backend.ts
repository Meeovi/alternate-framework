import type { CategoryProductsRef, CommerceBackendAdapter, DirectusRequestDescriptor } from 'alternate-sdk'
import type { MagentoAdapter } from '@mframework/adapter-magento'
// Self-referencing package import, not a relative path — nuxt-module-build
// only compiles module.ts and runtime/** into dist/, so a relative
// '../normalizers/normalizers' import would resolve to a dist/normalizers/
// that's never generated (see the exports["./normalizers"] entry in
// package.json, which points at the TS source directly, same as ".").
import { magentoNormalizers } from '@mframework/adapter-magento/normalizers'

// Field list is shaped to match exactly what magentoNormalizers.products
// (normalizers/products.ts) actually reads — nested selections use the
// { field: [...subfields] } form MagentoAdapter's parseFieldsToQuery
// expects. Categories are deliberately NOT normalized/exposed as a
// collection here — "departments"/"categories" are Directus-only CMS
// taxonomy; this adapter only ever resolves a category_uid internally
// (resolveCategoryUid below) to scope a products query, see
// getProductsByCategory on the returned adapter.
const PRODUCT_FIELDS = [
  'id', 'uid', 'sku', 'name', 'status', 'stock_status',
  { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] },
  { description: ['html'] },
  { short_description: ['html'] },
  { small_image: ['url'] },
  { image: ['url'] },
  { media_gallery: ['url'] },
]

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

// Resolves a Directus department/category into a Magento category_uid.
// externalId (departments.relative_id / categories.uid, when populated) is
// already assumed to be the Magento category_uid, so it skips the lookup
// round trip entirely; otherwise falls back to a slug -> url_key lookup.
async function resolveCategoryUid(magento: MagentoAdapter, ref: CategoryProductsRef): Promise<string | null> {
  if (ref.externalId) return ref.externalId

  const result = await magento.store.queryField('categories', {
    filters: { url_key: { eq: ref.slug } },
    pageSize: 1,
  }, { fields: [{ items: ['uid'] }] })

  return result?.items?.[0]?.uid ?? null
}

async function fetchProductsByCategoryUid(magento: MagentoAdapter, categoryUid: string) {
  const result = await magento.store.queryField('products', {
    filter: { category_uid: { eq: categoryUid } },
    pageSize: 50,
  }, { fields: [{ items: PRODUCT_FIELDS }, 'total_count'] })

  return (result?.items ?? []).map((item: any) => magentoNormalizers.products(item))
}

export function createMagentoCommerceBackendAdapter(magento: MagentoAdapter): CommerceBackendAdapter {
  return {
    id: 'magento',
    collections: ['products', 'orders'],
    isEnabled: () => true,
    async request({ collection, key }: DirectusRequestDescriptor) {
      switch (collection) {
        case 'products': {
          const items = await fetchProducts(magento, key)
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
    async getProductsByCategory(ref: CategoryProductsRef) {
      const categoryUid = await resolveCategoryUid(magento, ref)
      // No matching Magento category (e.g. a Directus-only department with
      // no Magento counterpart) — degrade to an empty list, never throw.
      if (!categoryUid) return []
      return fetchProductsByCategoryUid(magento, categoryUid)
    },
  }
}
