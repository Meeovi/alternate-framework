export type Category = {
  id: string
  name: string
  description?: string
}

export type CatalogItem = {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  category: Category
  images: string[]
}

export type Order = {
  id: string
  product: Product
  quantity: number
  totalPrice: number
  status: 'pending' | 'completed' | 'cancelled'
}

export type User = {
  id: string
  name: string
  email: string
  orders: Order[]
}
