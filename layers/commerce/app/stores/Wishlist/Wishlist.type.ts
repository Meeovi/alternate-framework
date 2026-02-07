export interface WishlistProduct {
  id: string
  sku?: string
  name?: string
  price?: number
  qty?: number
  [key: string]: any
}

export interface WishlistState {
  items: WishlistProduct[]
}
