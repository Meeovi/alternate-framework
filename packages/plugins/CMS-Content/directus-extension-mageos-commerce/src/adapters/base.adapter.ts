import type { NormalizedCategory, NormalizedProduct, Paginated, ProductQueryOptions } from '../types'

/**
 * What every commerce backend implements. The endpoint (src/index.ts) only
 * talks to this interface, so swapping Mage-OS for another backend means
 * adding an adapter and changing createAdapter() — not the /commerce/* API.
 *
 * Adapters throw CommerceError (src/errors.ts) for upstream failures so the
 * endpoint can answer with a consistent status and serve cached data.
 */
export interface ICommerceAdapter {
  /** A short id for logs and cache keys, e.g. "mage-os". */
  readonly id: string

  getProducts(params: ProductQueryOptions): Promise<NormalizedProduct[]>

  /**
   * getProducts() plus the totals the endpoint needs for pagination. Kept
   * as its own method so getProducts() stays a plain list.
   */
  getProductPage(params: ProductQueryOptions): Promise<Paginated<NormalizedProduct>>

  getProductBySlug(slug: string): Promise<NormalizedProduct | null>

  /** The category tree below the store's root category. */
  getCategories(): Promise<NormalizedCategory[]>

  /** Live stock quantity per SKU; SKUs the backend doesn't know are omitted. */
  getInventory(skus: string[]): Promise<Record<string, number>>
}
