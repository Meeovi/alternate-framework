// packages/adapters/adapter-magento/src/normalizers/channels.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `channels` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento channel structure.
export interface DirectusChannel {
  id: string
  name?: string
  code?: string
  status?: boolean
  sort_order?: number
}

// Magento channel payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoChannel {
  channel_id: number | string
  name: string
  code: string
  status?: boolean
  sort_order?: number
}

export const normalizeMagentoChannel: Normalizer<RawMagentoChannel, DirectusChannel> = createNormalizer<RawMagentoChannel, DirectusChannel>({
  id: (src) => String(src?.channel_id ?? ''),
  name: (src) => src?.name ?? '',
  code: (src) => src?.code ?? '',
  status: (src) => src?.status ?? false,
  sort_order: (src) => Number(src?.sort_order ?? 0)
})
