export interface Product {
  id: string
  title?: string
  name?: string
  slug?: string
  description?: string
  price: number
  image?: string | null
  images?: string[]
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}