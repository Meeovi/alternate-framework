export interface ProductItemGQL {
  id: number
  sku: string
  name: string
  type_id?: string
  price_range?: {
    minimum_price?: {
      regular_price?: { value: number }
    }
  }
  media_gallery_entries?: Array<{ file: string }>
  custom_attributes?: Array<{ attribute_code: string; value: any }>
}

export interface ProductsQuery {
  products: { items: ProductItemGQL[] }
}

export interface CartItemGQL {
  id: string | number
  product?: { sku?: string; name?: string }
  quantity?: number
  prices?: { price?: { value?: number } }
}

export interface CartQuery {
  cart: { items: CartItemGQL[] }
}

export interface CustomerGQL {
  id: number
  email: string
  firstname: string
  lastname: string
}

export interface CustomerQuery {
  customer: CustomerGQL
}
