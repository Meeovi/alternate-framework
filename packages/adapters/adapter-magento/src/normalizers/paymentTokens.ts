// packages/adapters/adapter-magento/src/normalizers/paymentTokens.ts
import { createNormalizer, type Normalizer } from './automapper'
import type { Mage_PaymentToken } from '../graphql/schema-types'

// Directus has no dedicated `payment_tokens` collection in this schema,
// so we map to a lightweight local shape that mirrors the Magento payment token structure.
export interface DirectusPaymentToken {
  id: string
  customer_id?: string
  payment_method_code?: string
  public_hash?: string
  type?: string
  details?: string
}

export const normalizeMagentoPaymentToken: Normalizer<Mage_PaymentToken, DirectusPaymentToken> = createNormalizer<Mage_PaymentToken, DirectusPaymentToken>({
  id: (src) => String((src as any)?.public_hash ?? src?.payment_method_code ?? ''),
  customer_id: (src) => String((src as any)?.customer_id ?? ''),
  payment_method_code: (src) => src?.payment_method_code ?? '',
  public_hash: (src) => src?.public_hash ?? '',
  type: (src) => src?.type ?? '',
  details: (src) => src?.details ?? ''
})
