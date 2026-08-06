// packages/adapters/adapter-magento/src/normalizers/adminActionLogs.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `admin_action_logs` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento admin action log structure.
export interface DirectusAdminActionLog {
  id: string
  action?: string
  user_id?: string
  created_at?: string
  ip_address?: string
}

// Magento admin action log payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoAdminActionLog {
  log_id: number | string
  action: string
  user_id?: number | string
  created_at?: string
  ip_address?: string
}

export const normalizeMagentoAdminActionLog: Normalizer<RawMagentoAdminActionLog, DirectusAdminActionLog> = createNormalizer<RawMagentoAdminActionLog, DirectusAdminActionLog>({
  id: (src) => String(src?.log_id ?? ''),
  action: (src) => src?.action ?? '',
  user_id: (src) => String(src?.user_id ?? ''),
  created_at: (src) => src?.created_at ?? '',
  ip_address: (src) => src?.ip_address ?? ''
})
