// packages/adapters/adapter-magento/src/normalizers/sharedCatalogs.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `shared_catalogs` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento shared catalog structure.
export interface DirectusSharedCatalog {
  id: string
  name?: string
  description?: string
  customer_group_id?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Magento shared catalog payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoSharedCatalog {
  catalog_id: number | string
  name: string
  description?: string
  customer_group_id?: number | string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoSharedCatalog: Normalizer<RawMagentoSharedCatalog, DirectusSharedCatalog> = createNormalizer<RawMagentoSharedCatalog, DirectusSharedCatalog>({
  id: (src) => String(src?.catalog_id ?? ''),
  name: (src) => src?.name ?? '',
  description: (src) => src?.description ?? '',
  customer_group_id: (src) => String(src?.customer_group_id ?? ''),
  is_active: (src) => src?.is_active ?? false,
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
