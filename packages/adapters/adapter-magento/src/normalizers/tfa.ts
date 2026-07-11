// packages/adapters/adapter-magento/src/normalizers/tfa.ts
import { createNormalizer } from './automapper'
import type { Query as DirectusQuery } from 'adapter-directus'

// `Directus_Directus_Users` is not a top-level Query field, but it is referenced
// by collections such as team, so we derive the element type from there.
type DirectusTfa = NonNullable<NonNullable<DirectusQuery['Directus_team']>[0]['user_created']>

// Magento two-factor-authentication records are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoTfa {
  user_id: number | string
  provider?: string
  enabled?: boolean
}

export const normalizeMagentoTfa = createNormalizer<RawMagentoTfa, DirectusTfa>({
  id: (src) => String(src?.user_id ?? ''),
  external_identifier: (src) => String(src?.user_id ?? ''),
  status: (src) => (src?.enabled ? 'active' : 'inactive')
})
