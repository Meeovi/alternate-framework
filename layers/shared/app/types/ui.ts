export interface Image {
  url: string
  alt?: string
  width?: number
  height?: number
  [key: string]: any
}

export interface Product {
  id: string
  name?: string
  price?: number
  images?: Image[]
  [key: string]: any
}

export interface Category {
  id: string
  name?: string
  slug?: string
  image?: string
  [key: string]: any
}
