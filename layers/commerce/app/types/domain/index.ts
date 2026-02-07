export type Price = {
  value: number
  currency?: string
}

export type Image = {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface Product {
  id: string
  sku?: string
  title: string
  description?: string
  price: number | Price
  images?: Image[]
  variants?: any[]
  attributes?: Record<string, any>
  [key: string]: any
}

export interface CartItem {
  id: string
  sku?: string
  quantity: number
  product?: Product
  [key: string]: any
}

export interface Cart {
  id: string
  email?: string
  items: CartItem[]
  total_quantity?: number
  prices?: Record<string, any>
  raw?: any
}

export interface Order {
  id: string
  number?: string
  items?: CartItem[]
  total?: Price | number
  status?: string
  created_at?: string
  raw?: any
}

export interface Customer {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  [key: string]: any
}

export interface GiftCard {
  code: string
  balance?: Price | number
  currency?: string
  raw?: any
}

export interface Subscription {
  id: string
  productId?: string
  status?: string
  schedule?: any
  raw?: any
}

export interface PaymentIntent {
  id: string
  status?: string
  amount?: Price | number
  currency?: string
  method?: string
  raw?: any
}

export interface Review {
  id: string
  title?: string
  detail?: string
  rating?: number
  created_at?: string
  author?: string
  raw?: any
}

 
