// packages/adapters/adapter-magento/src/normalizers/category.ts
import { createNormalizer } from './automapper'
import type { Mage_CategoryInterface } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusCategory = NonNullable<DirectusQuery['Directus_categories']>[0]

export const normalizeMagentoCategory = createNormalizer<Mage_CategoryInterface, DirectusCategory>({
  id: (src) => String(src?.uid ?? ''),
  name: (src) => src?.name ?? '',
  slug: (src) => src?.url_key ?? '',
  description: (src) => src?.description ?? '',
  title: (src) => src?.meta_title ?? '',
  content: (src) => src?.description ?? '',
  image: (src) => src?.image ?? null,
  sort: (src) => src?.position ?? 0
})
