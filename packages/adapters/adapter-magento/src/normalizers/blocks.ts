// packages/adapters/adapter-magento/src/normalizers/blocks.ts
import { createNormalizer } from './automapper'
import type { Mage_CmsBlock } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusBlock = NonNullable<DirectusQuery['Directus_page_blocks']>[0]

export const normalizeMagentoBlock = createNormalizer<Mage_CmsBlock, DirectusBlock>({
  id: (src) => src?.identifier ?? '',
  name: (src) => src?.title ?? '',
  content: (src) => src?.content ?? '',
  description: (src) => src?.title ?? '',
  slug: (src) => src?.identifier ?? '',
  collection: () => 'cms_block',
  status: () => 'published'
})
