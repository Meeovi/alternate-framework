// packages/adapters/adapter-magento/src/normalizers/blocks.ts
import type { Mage_CmsBlock } from "../graphql/schema-types";

// Directus has no dedicated `cms_blocks` collection in this schema, so we map to a
// lightweight local shape that mirrors the Pages collection fields.
export interface DirectusBlock {
  id: string
  title: string
  content: string
  name?: string
  status?: string
}

export function normalizeMagentoBlock(rawBlock: any): DirectusBlock {
  return {
    id: String(rawBlock?.identifier ?? ''),
    title: rawBlock?.name ?? '',
    content: rawBlock?.content ?? '',
    name: rawBlock?.name,
    status: 'published'
  };
}
