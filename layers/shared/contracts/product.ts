export interface Product {
  id: string
  title: string
  slug: string
  description?: string
  price: number
  images: string[]
  createdAt?: string
  updatedAt?: string
}
