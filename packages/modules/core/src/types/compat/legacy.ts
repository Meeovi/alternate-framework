// Legacy compatibility types (keeps older @mframework/types shapes available)
export interface Product {
  id?: string
  title?: string
  description?: string
  price?: number
}

export interface Session { id?: string; userId?: string; token?: string }
export interface User { id?: string; email?: string; name?: string }

// Re-export canonical types under legacy names for compatibility
export type { SearchQuery } from '../search/query'
export type { SearchResult } from '../search/result'
export type { AuthSession } from '../auth/session'
export type { CommerceCart, CommerceCartItem } from '../commerce/cart'
export type { CommercePrice } from '../commerce/product'


