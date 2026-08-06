// packages/adapters/adapter-magento/src/normalizers/glossaryTerms.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `glossary_terms` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento glossary term structure.
export interface DirectusGlossaryTerm {
  id: string
  term?: string
  definition?: string
  sort_order?: number
  status?: string
}

// Magento glossary term payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoGlossaryTerm {
  term_id: number | string
  term: string
  definition?: string
  sort_order?: number
  status?: string
}

export const normalizeMagentoGlossaryTerm: Normalizer<RawMagentoGlossaryTerm, DirectusGlossaryTerm> = createNormalizer<RawMagentoGlossaryTerm, DirectusGlossaryTerm>({
  id: (src) => String(src?.term_id ?? ''),
  term: (src) => src?.term ?? '',
  definition: (src) => src?.definition ?? '',
  sort_order: (src) => Number(src?.sort_order ?? 0),
  status: (src) => src?.status ?? 'enabled'
})
