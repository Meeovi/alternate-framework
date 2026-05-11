export interface CartItem {
  id: string
  productId: string
  sku?: string
  quantity: number
  price?: number
  [key: string]: any
}

export interface IndexedCartItem extends CartItem {
  index?: number
}

export interface Cart {
  id?: string
  items?: CartItem[]
  subtotal?: number
  total?: number
  tax_amount?: number
  shipping_amount?: number
  discount_amount?: number
  coupon_code?: string | null
  [key: string]: any
}