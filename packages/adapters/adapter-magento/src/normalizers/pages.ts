// packages/adapters/adapter-magento/src/normalizers/pages.ts
import { createNormalizer } from './automapper'
import type { Mage_CmsPage } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusPage = NonNullable<DirectusQuery['Directus_pages']>[0]

export const normalizeMagentoPage = createNormalizer<Mage_CmsPage, DirectusPage>({
  id: (src) => String(src?.identifier ?? ''),
  title: (src) => src?.title ?? '',
  name: (src) => src?.title ?? '',
  slug: (src) => src?.url_key ?? '',
  content: (src) => src?.content ?? '',
  permalink: (src) => src?.relative_url ?? '',
  status: () => 'published'
})
