// packages/adapters/adapter-magento/src/normalizers/store.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_StoreConfig } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusStore = NonNullable<DirectusQuery['Directus_websites']>[0]

export const normalizeMagentoStore: Normalizer<Mage_StoreConfig, DirectusStore> = createNormalizer<Mage_StoreConfig, DirectusStore>({
  id: (src) => String(src?.store_code ?? ''),
  name: (src) => src?.store_name ?? '',
  slug: (src) => src?.store_code ?? '',
  url: (src) => src?.base_url ?? '',
  description: (src) => src?.store_group_name ?? '',
  status: () => 'active',
  type: () => 'store'
})
