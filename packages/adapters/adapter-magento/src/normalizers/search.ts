// packages/adapters/adapter-magento/src/normalizers/search.ts
import { createNormalizer } from './automapper'
import type { Mage_SearchSuggestion } from '../graphql/schema-types'

// Directus has no dedicated `search` collection in this schema, so we map to a
// lightweight local shape that mirrors the Magento search suggestion structure.
export interface DirectusSearch {
  query: string
}

export const normalizeMagentoSearch = createNormalizer<Mage_SearchSuggestion, DirectusSearch>({
  query: (src) => src?.search ?? ''
})
