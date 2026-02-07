export interface ComparableAttribute {
  id?: string
  name?: string
  values?: string[]
}

export interface ComparableProduct {
  id?: string
  sku: string
  name?: string
}

export interface ComparableItem {
  product: ComparableProduct
  attributes?: Record<string, any>
}

export interface CompareList {
  attributes?: ComparableAttribute[]
  products?: ComparableProduct[]
  items?: ComparableItem[]
}

export {}
