// packages/adapters/adapter-magento/src/normalizers/tax.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_TaxItem } from '../graphql/schema-types'
import type { Query as DirectusQuery } from 'adapter-directus'

type DirectusTax = NonNullable<DirectusQuery['Directus_taxes']>[0]

export const normalizeMagentoTax: Normalizer<Mage_TaxItem, DirectusTax> = createNormalizer<Mage_TaxItem, DirectusTax>({
  id: (src) => src?.title ?? '',
  rate: (src) => src?.rate ?? 0,
  tax_class: (src) => src?.title ?? ''
})
