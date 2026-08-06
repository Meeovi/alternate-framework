// packages/adapters/adapter-magento/src/normalizers/invitations.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `invitations` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento invitation structure.
export interface DirectusInvitation {
  id: string
  email?: string
  status?: string
  role_id?: string
  company_id?: string
  invited_by?: string
  created_at?: string
  updated_at?: string
}

// Magento invitation payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoInvitation {
  entity_id: number | string
  email: string
  status?: string
  role_id?: number | string
  company_id?: number | string
  invited_by?: number | string
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoInvitation: Normalizer<RawMagentoInvitation, DirectusInvitation> = createNormalizer<RawMagentoInvitation, DirectusInvitation>({
  id: (src) => String(src?.entity_id ?? ''),
  email: (src) => src?.email ?? '',
  status: (src) => src?.status ?? 'pending',
  role_id: (src) => String(src?.role_id ?? ''),
  company_id: (src) => String(src?.company_id ?? ''),
  invited_by: (src) => String(src?.invited_by ?? ''),
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
