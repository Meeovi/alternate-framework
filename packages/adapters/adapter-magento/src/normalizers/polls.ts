// packages/adapters/adapter-magento/src/normalizers/polls.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `polls` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento poll structure.
export interface DirectusPoll {
  id: string
  name?: string
  question?: string
  status?: string
  date_created?: string
  date_updated?: string
}

// Magento poll payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoPoll {
  poll_id: number | string
  name: string
  question?: string
  status?: string
  date_created?: string
  date_updated?: string
}

export const normalizeMagentoPoll: Normalizer<RawMagentoPoll, DirectusPoll> = createNormalizer<RawMagentoPoll, DirectusPoll>({
  id: (src) => String(src?.poll_id ?? ''),
  name: (src) => src?.name ?? '',
  question: (src) => src?.question ?? '',
  status: (src) => src?.status ?? 'enabled',
  date_created: (src) => src?.date_created ?? '',
  date_updated: (src) => src?.date_updated ?? ''
})
