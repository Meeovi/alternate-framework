// packages/adapters/adapter-magento/src/normalizers/vendors.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

// Directus has no dedicated `vendors` collection in this schema, so we map to a
// lightweight local shape that mirrors the Magento marketplace vendor structure.
export interface DirectusVendors {
  id: string
  company_name?: string
  slug?: string
  avatar?: string | null
}

type DirectusVendor = DirectusVendors

// Define explicit fallback types if Magento's Marketplace extension attributes aren't fully declared in codegen
export interface RawMagentoVendor {
  entity_id: number | string
  vendor_shop_title: string
  vendor_shop_url: string
  logo?: string
}

export const normalizeMagentoVendor = createNormalizer<RawMagentoVendor, DirectusVendor>({
  id: (src) => String(src?.entity_id ?? ''),
  company_name: (src) => src?.vendor_shop_title ?? '',
  slug: (src) => src?.vendor_shop_url ?? '',
  avatar: (src) => src?.logo ?? null
})
