// packages/adapters/adapter-magento/src/normalizers/cart.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Query as MagentoQuery } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusCart = NonNullable<DirectusQuery['Directus_cart']>[0]
type MageCartRaw = NonNullable<MagentoQuery['Mage_cart']>

export const normalizeMagentoCart: Normalizer<MageCartRaw, DirectusCart> = createNormalizer<MageCartRaw, DirectusCart>({
  id: (src) => String(src?.id ?? ''),
  total: (src) => src?.prices?.grand_total?.value ?? 0,
  total_price: (src) => src?.prices?.grand_total?.value ?? 0,
  subtotal: (src) => src?.prices?.subtotal_excluding_tax?.value ?? src?.prices?.subtotal_including_tax?.value ?? 0,
  items: (src) => src?.items?.map((item) => ({
    id: String(item?.id ?? ''),
    price: item?.product?.sku ?? null,
    product_id: item?.product?.sku ?? null,
    quantity: item?.quantity ?? 0,
    total: item?.quantity ?? 0,
    variant: null,
    variant_id: null
  })) ?? []
})