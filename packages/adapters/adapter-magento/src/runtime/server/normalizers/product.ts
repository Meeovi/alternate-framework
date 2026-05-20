import type { MagentoProduct } from '../types/product'

export interface NormalizedProduct {
  id: number
  sku: string
  name: string
  price?: number
  currency?: string
  images: string[]
  attributes: Record<string, string>
}

export function normalizeProductREST(raw: MagentoProduct): NormalizedProduct {
  const attributes: Record<string, string> = {}

  raw.custom_attributes?.forEach((attr) => {
    attributes[attr.attribute_code] = String(attr.value)
  })

  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    price: raw.price,
    currency: undefined,
    images: raw.media_gallery_entries?.map((img) => img.file || img.url) || [],
    attributes,
  }
}

export function normalizeProductGraphQL(raw: any): NormalizedProduct {
  return {
    id: raw.id,
    sku: raw.sku,
    name: raw.name,
    price: raw.price_range?.minimum_price?.regular_price?.value,
    currency: raw.price_range?.minimum_price?.regular_price?.currency,
    images: [], // GraphQL images can be added later
    attributes: {}, // GraphQL attributes can be added later
  }
}
