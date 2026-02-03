export interface ComparableAttribute { key: string; value: string }

export interface ComparableItem { id: string; sku?: string; name?: string }

export interface ComparableProduct {
  id: string
  sku?: string
  name?: string
  attributes?: ComparableAttribute[]
}

export interface CompareList {
  attributes?: ComparableAttribute[]
  products?: ComparableProduct[]
  items?: ComparableItem[]
}

export type ProductCompare = ComparableProduct

export default ProductCompare
