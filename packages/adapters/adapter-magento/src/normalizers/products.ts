// packages/adapters/adapter-magento/src/normalizers/products.ts
import { createNormalizer } from './automapper'
import type { Query as MagentoQuery } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusPage = NonNullable<DirectusQuery['Directus_pages']>[0]
type DirectusProduct = NonNullable<DirectusQuery['Directus_products']>[0]
type MageProductRaw = NonNullable<NonNullable<MagentoQuery['Mage_products']>['items']>[0]

export const normalizeProductToPage = createNormalizer<MageProductRaw, DirectusPage>({
  id: (src) => String(src?.id ?? ''),
  title: (src) => src?.name ?? '',
  slug: (src) => src?.sku ?? '',
  content: (src) => src?.description?.html ?? '',
})

export const normalizeMagentoProduct = createNormalizer<MageProductRaw, DirectusProduct>({
  id: (src) => String(src?.id ?? ''),
  title: (src) => src?.name ?? '',
  sku: (src) => src?.sku ?? '',
  price: (src) => src?.price_range?.minimum_price?.final_price?.value ?? 0,
  description: (src) => src?.description ?? '',

  // Marketplace extension attribute fields mapped safely
  vendor_id: (src) => (src as any)?.mp_vendor_id ?? null 
})