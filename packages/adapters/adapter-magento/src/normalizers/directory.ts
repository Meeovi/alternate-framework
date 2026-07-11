// packages/adapters/adapter-magento/src/normalizers/directory.ts
import { createNormalizer } from './automapper'
import type { Mage_Country, Mage_Region } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusCountry = NonNullable<DirectusQuery['Directus_countries']>[0]
type DirectusState = NonNullable<DirectusQuery['Directus_states']>[0]

export const normalizeMagentoCountry = createNormalizer<Mage_Country, DirectusCountry>({
  id: (src) => src?.id ?? '',
  name: (src) => src?.full_name_english ?? '',
  iso2: (src) => src?.two_letter_abbreviation ?? '',
  iso3: (src) => src?.three_letter_abbreviation ?? '',
  native: (src) => src?.full_name_locale ?? ''
})

export const normalizeMagentoRegion = createNormalizer<Mage_Region, DirectusState>({
  id: (src) => String(src?.id ?? ''),
  name: (src) => src?.name ?? '',
  iso2: (src) => src?.code ?? '',
  country_code: (src) => (src as any)?.country_id ?? null
})
