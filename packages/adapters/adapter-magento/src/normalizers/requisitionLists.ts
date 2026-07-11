// packages/adapters/adapter-magento/src/normalizers/requisitionLists.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusRequisitionList = NonNullable<DirectusQuery['Directus_lists']>[0]

// Magento B2B requisition lists are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoRequisitionList {
  entity_id: number | string
  name?: string
  description?: string
  items?: Array<{ sku?: string; qty?: number }>
}

export const normalizeMagentoRequisitionList = createNormalizer<RawMagentoRequisitionList, DirectusRequisitionList>({
  id: (src) => String(src?.entity_id ?? ''),
  name: (src) => src?.name ?? '',
  description: (src) => src?.description ?? '',
  sort: (src) => src?.items?.length ?? 0,
  status: () => 'active'
})
