import type { CatalogItem, ProviderId } from '../../runtime/types'

/** Decrypted credentials as stored for a connection (provider-specific). */
export type Credentials = Record<string, string | number | undefined>

export interface SupplierVariant {
  id: string
  name: string
  /** What the seller pays the supplier (CJ). Null when the supplier doesn't say. */
  cost: number | null
  /** The seller's own retail price at the supplier (Printful), if any. */
  retailPrice: number | null
  /** Units available; null = print on demand / not tracked. */
  stock: number | null
  weightKg: number | null
  image: string | null
}

export interface SupplierProduct {
  id: string
  name: string
  description: string
  images: string[]
  variants: SupplierVariant[]
}

export interface Recipient {
  name: string
  address1: string
  address2?: string
  city: string
  region?: string
  regionCode?: string
  countryCode: string
  postcode?: string
  phone?: string
  email?: string
}

export interface SupplierOrderInput {
  /** Our reference — Magento increment id + seller, unique per connection. */
  externalId: string
  recipient: Recipient
  items: { variantId: string, quantity: number }[]
  /** Printful: confirm for fulfilment (charges the seller). CJ: ignored — always left unpaid. */
  confirm: boolean
}

export interface SupplierOrderResult {
  supplierOrderId: string
  /** `awaiting_payment` = created but the seller must pay/confirm at the supplier. */
  status: 'forwarded' | 'awaiting_payment'
}

export interface Shipment {
  trackingNumber: string
  trackingUrl: string | null
  carrier: string
}

/**
 * One supplier. Implementations are stateless; credentials come in per
 * call. `refresh` lets a provider hand back updated credentials (e.g. a new
 * access token) for the caller to persist.
 */
export interface SupplierProvider {
  id: ProviderId
  label: string
  /** Turns what the seller pasted into stored credentials; throws if they don't work. */
  connect: (input: Record<string, string>) => Promise<{ credentials: Credentials, label: string }>
  /** Returns fresh credentials when they need renewing, else null. */
  refresh?: (credentials: Credentials) => Promise<Credentials | null>
  listCatalog: (credentials: Credentials, options: { page: number, query?: string }) => Promise<{ items: CatalogItem[], hasMore: boolean }>
  getProduct: (credentials: Credentials, productId: string) => Promise<SupplierProduct>
  /** Current stock per variant id (null = untracked). */
  getStock: (credentials: Credentials, productId: string) => Promise<Record<string, number | null>>
  createOrder: (credentials: Credentials, order: SupplierOrderInput) => Promise<SupplierOrderResult>
  getShipments: (credentials: Credentials, supplierOrderId: string) => Promise<Shipment[]>
}

export class SupplierError extends Error {
  constructor(message: string, public status = 502) {
    super(message)
  }
}
