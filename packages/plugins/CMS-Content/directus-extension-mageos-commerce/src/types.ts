/**
 * The normalized commerce contract exposed at /commerce/*. Nothing here is
 * Magento-specific: any adapter (src/adapters) maps its backend onto these
 * shapes, so the frontend never changes when the backend does.
 */

export interface NormalizedProduct {
  id: string
  sku: string
  name: string
  slug: string
  price: {
    regular: number
    final: number
    currency: string
  }
  inStock: boolean
  images: string[]
  categories: { id: string, name: string, slug: string }[]
  attributes: Record<string, any>
  updatedAt: string
}

export interface NormalizedCategory {
  id: string
  name: string
  slug: string
  /** Full path of slugs from the root, e.g. "women/tops-women/jackets-women". */
  path: string
  /** Depth below the store's root category (top-level categories are 1). */
  level: number
  position: number
  productCount: number
  includeInMenu: boolean
  children: NormalizedCategory[]
}

export type ProductSort = 'relevance' | 'position' | 'name' | '-name' | 'price' | '-price'

export interface ProductQueryOptions {
  /** 1-based. */
  page?: number
  pageSize?: number
  search?: string
  /** Category id (as returned in NormalizedCategory.id). */
  categoryId?: string
  /** Category path (NormalizedCategory.path), an alternative to categoryId. */
  categoryPath?: string
  skus?: string[]
  priceMin?: number
  priceMax?: number
  sort?: ProductSort
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
