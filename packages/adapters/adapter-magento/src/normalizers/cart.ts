// packages/adapters/adapter-magento/src/normalizers/cart.ts
import { createNormalizer } from './automapper'
import type { Query as MagentoQuery } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusCart = NonNullable<DirectusQuery['Directus_cart']>[0]
type MageCartRaw = NonNullable<MagentoQuery['Mage_cart']>

export const normalizeMagentoCart = createNormalizer<MageCartRaw, DirectusCart>({
  id: (src) => src?.id ?? '',
  total: (src) => src?.prices?.grand_total?.value ?? 0,
  items_count: (src) => src?.total_quantity ?? 0,
  // Custom structural map for line items to extract and match backend array payloads
  items: (src) => src?.items?.map(item => ({
    id: item?.id,
    product_name: item?.product?.name,
    quantity: item?.quantity,
    vendor_id: (item as any)?.vendor_id ?? null
  })) ?? []
})