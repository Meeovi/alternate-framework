export interface CartItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  total: number
  image?: string
  vendorId?: string
  metadata?: Record<string, unknown>
}

export interface CartTotals {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
}

export interface Address {
  firstName: string
  lastName: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  company?: string
  [key: string]: unknown
}
