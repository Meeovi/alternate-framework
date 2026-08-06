// packages/adapters/adapter-magento/src/normalizers/productLinks.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_ProductLinks } from '../graphql/schema-types'

// Directus has no dedicated `product_links` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento product link structure.
export interface DirectusProductLink {
  id: string
  product_id?: string
  linked_product_sku?: string
  link_type?: string
  linked_product_type?: string
  position?: number
}

export const normalizeMagentoProductLink: Normalizer<Mage_ProductLinks, DirectusProductLink> = createNormalizer<Mage_ProductLinks, DirectusProductLink>({
  id: (src) => String((src as any)?.sku ?? ''),
  product_id: (src) => String((src as any)?.product_id ?? ''),
  linked_product_sku: (src) => src?.linked_product_sku ?? '',
  link_type: (src) => src?.link_type ?? '',
  linked_product_type: (src) => src?.linked_product_type ?? '',
  position: (src) => src?.position ?? 0
})
