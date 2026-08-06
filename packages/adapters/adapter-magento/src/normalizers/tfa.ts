// packages/adapters/adapter-magento/src/normalizers/tfa.ts
import { createNormalizer, type Normalizer } from './automapper'

// `Directus_Directus_Users` is referenced by collections such as team,
// so we derive the element type from the team relation.
type DirectusTfa = {
  id: string
  external_identifier?: string
  status?: string
}

// Magento two-factor-authentication records are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoTfa {
  user_id: number | string
  provider?: string
  enabled?: boolean
}

export const normalizeMagentoTfa: Normalizer<RawMagentoTfa, DirectusTfa> = createNormalizer<RawMagentoTfa, DirectusTfa>({
  id: (src) => String(src?.user_id ?? ''),
  external_identifier: (src) => String(src?.user_id ?? ''),
  status: (src) => (src?.enabled ? 'active' : 'inactive')
})
