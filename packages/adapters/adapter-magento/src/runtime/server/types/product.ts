export interface MagentoProductPrice {
  currency: string
  value: number
}

export interface MagentoProductImage {
  url: string
  label?: string
  position?: number
}

export interface MagentoProduct {
  id: number
  sku: string
  name: string
  type_id: string
  status: number
  visibility: number
  price?: number
  media_gallery_entries?: MagentoProductImage[]
  custom_attributes?: { attribute_code: string; value: string }[]
}
