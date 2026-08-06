// packages/adapters/adapter-magento/src/normalizers/catalogEvents.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `catalog_events` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento catalog event structure.
export interface DirectusCatalogEvent {
  id: string
  name?: string
  description?: string
  status?: string
  sort_order?: number
  date_from?: string
  date_to?: string
}

// Magento catalog event payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoCatalogEvent {
  event_id: number | string
  name: string
  description?: string
  status?: string
  sort_order?: number
  date_from?: string
  date_to?: string
}

export const normalizeMagentoCatalogEvent: Normalizer<RawMagentoCatalogEvent, DirectusCatalogEvent> = createNormalizer<RawMagentoCatalogEvent, DirectusCatalogEvent>({
  id: (src) => String(src?.event_id ?? ''),
  name: (src) => src?.name ?? '',
  description: (src) => src?.description ?? '',
  status: (src) => src?.status ?? 'enabled',
  sort_order: (src) => Number(src?.sort_order ?? 0),
  date_from: (src) => src?.date_from ?? '',
  date_to: (src) => src?.date_to ?? ''
})
