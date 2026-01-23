import { createNormalizer } from '@meeovi/normalizer-core'
import { validate, validators, optional } from '@meeovi/normalizer-core'
import type { ProductItemGQL } from '../../types/graphql'

export interface NormalizedProduct {
  id: number
  sku: string
  title: string
  description?: string
  price?: number
  images: string[]
  type: string
}

const productSchema = {
  id: validators.number,
  sku: validators.string,
  title: validators.string,
  description: optional(validators.string),
  price: optional(validators.number),
  images: validators.array(validators.string),
  type: validators.string
}

export const normalizeProduct = createNormalizer<ProductItemGQL | any, NormalizedProduct>((p) => {
  const descriptionAttr = (p.custom_attributes || []).find(
    (a: any) => a.attribute_code === 'description'
  )

  const mapped = {
    id: p.id,
    sku: p.sku,
    title: p.name,
    description: descriptionAttr?.value,
    price: p.price ?? p.price_range?.minimum_price?.regular_price?.value,
    images: (p.media_gallery_entries || []).map((i: any) => i.file),
    type: p.type_id
  }

  return validate<NormalizedProduct>(productSchema as any, mapped)
})
