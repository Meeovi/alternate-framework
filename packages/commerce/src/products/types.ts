export interface Product {
  id: string
  title: string
  description?: string
  price: number
  images: string[]
  [key: string]: any
}

export interface ProductProvider {
  getProduct(id: string): Promise<Product>
  listProducts(params?: Record<string, any>): Promise<Product[]>
}
