import type { Product } from './product.js'

export type ProductFilter = {
  search?: string
  categoryId?: string
  pageSize?: number
  currentPage?: number
  [key: string]: any
}

export type Category = {
  id: string
  name: string
  [key: string]: any
}

export type AddToCartInput = {
  cartId?: string
  productId: string
  quantity: number
  [key: string]: any
}

export type UpdateCartInput = {
  cartId: string
  itemId: string
  quantity: number
  [key: string]: any
}

export type CartItem = {
  id: string
  productId: string
  quantity: number
  price: number
  [key: string]: any
}

export type Cart = {
  id: string
  items: CartItem[]
  [key: string]: any
}

export interface CommerceAdapter {
  getProduct(id: string): Promise<Product | null>
  getProducts(filter: ProductFilter): Promise<Product[]>
  getCategories(): Promise<Category[]>
  addToCart(input: AddToCartInput): Promise<Cart | null>
  updateCart(input: UpdateCartInput): Promise<Cart | null>
  removeFromCart(itemId: string): Promise<Cart | null>
}