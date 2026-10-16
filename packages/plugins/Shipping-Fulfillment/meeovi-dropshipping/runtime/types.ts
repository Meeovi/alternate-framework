export type ProviderId = 'printful' | 'cj'

export interface MeeoviDropshippingModuleOptions {
  /** Base path of the plugin's API. */
  apiBase?: string
  /** better-auth session endpoint (same-origin) used to identify the seller. */
  sessionEndpoint?: string
  /** Roles allowed to use dropshipping (comma-separated better-auth roles). */
  roles?: string[]
  /** Where the supplier page is added; false to add no page. */
  page?: false | { path?: string, layout?: string, middleware?: string[] }
  /** Suppliers sellers may connect. */
  providers?: ProviderId[]
  /** Background jobs (production only unless forced). */
  sync?: {
    enabled?: boolean
    stockEveryMinutes?: number
    ordersEveryMinutes?: number
  }
  /** Print-on-demand items have no stock count; this is what Magento shows. */
  printOnDemandQty?: number
}

export interface MarkupRule {
  /** `percent` adds value% to the supplier cost; `fixed` adds an amount. */
  type: 'percent' | 'fixed'
  value: number
  /** Round up to .99 endings. */
  charmPricing?: boolean
}

/** A connection as the seller sees it — never includes credentials. */
export interface SupplierConnection {
  id: string
  provider: ProviderId
  label: string
  status: 'active' | 'error' | 'disconnected'
  lastError: string | null
  autoConfirmOrders: boolean
  dateCreated: string
}

export interface CatalogItem {
  id: string
  name: string
  image: string | null
  /** Supplier cost (CJ) or the seller's retail price (Printful), in USD. */
  price: number | null
  variants: number | null
}

export interface ImportedProduct {
  id: string
  provider: ProviderId
  connectionId: string
  supplierProductId: string
  supplierVariantId: string
  sku: string
  name: string
  cost: number | null
  price: number
  stock: number | null
  status: 'active' | 'out_of_stock' | 'error'
  lastError: string | null
  lastSynced: string | null
}

export interface ForwardedOrder {
  id: string
  provider: ProviderId
  magentoOrder: string
  supplierOrderId: string | null
  status: 'forwarded' | 'awaiting_payment' | 'shipped' | 'error'
  trackingNumber: string | null
  trackingUrl: string | null
  lastError: string | null
  dateCreated: string
}
