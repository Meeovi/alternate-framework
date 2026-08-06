// packages/adapters/adapter-magento/src/normalizers/transactions.ts
import { createNormalizer, type Normalizer } from './automapper'

// Directus has no dedicated `transactions` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento transaction structure.
export interface DirectusTransaction {
  id: string
  order_id?: string
  payment_id?: string
  amount?: number
  currency?: string
  status?: string
  transaction_type?: string
  created_at?: string
  updated_at?: string
}

// Magento transaction payloads are not fully declared in codegen,
// so we define an explicit fallback raw shape here.
export interface RawMagentoTransaction {
  transaction_id: number | string
  order_id?: number | string
  payment_id?: number | string
  amount: number
  currency?: string
  status: string
  transaction_type?: string
  created_at?: string
  updated_at?: string
}

export const normalizeMagentoTransaction: Normalizer<RawMagentoTransaction, DirectusTransaction> = createNormalizer<RawMagentoTransaction, DirectusTransaction>({
  id: (src) => String(src?.transaction_id ?? ''),
  order_id: (src) => String(src?.order_id ?? ''),
  payment_id: (src) => String(src?.payment_id ?? ''),
  amount: (src) => Number(src?.amount ?? 0),
  currency: (src) => src?.currency ?? 'USD',
  status: (src) => src?.status ?? '',
  transaction_type: (src) => src?.transaction_type ?? '',
  created_at: (src) => src?.created_at ?? '',
  updated_at: (src) => src?.updated_at ?? ''
})
