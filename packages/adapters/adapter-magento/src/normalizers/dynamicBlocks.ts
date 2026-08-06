// packages/adapters/adapter-magento/src/normalizers/dynamicBlocks.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `dynamic_blocks` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento dynamic block structure.
export interface DirectusDynamicBlock {
  id: string
  name?: string
  title?: string
  content?: string
  status?: string
  sort_order?: number
}

// Magento dynamic block payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoDynamicBlock {
  block_id: number | string
  name: string
  title: string
  content?: string
  status?: number
  sort_order?: number
}

export const normalizeMagentoDynamicBlock: Normalizer<RawMagentoDynamicBlock, DirectusDynamicBlock> = createNormalizer<RawMagentoDynamicBlock, DirectusDynamicBlock>({
  id: (src) => String(src?.block_id ?? ''),
  name: (src) => src?.name ?? '',
  title: (src) => src?.title ?? '',
  content: (src) => src?.content ?? '',
  status: (src) => (src?.status === 1 ? 'enabled' : 'disabled'),
  sort_order: (src) => Number(src?.sort_order ?? 0)
})
