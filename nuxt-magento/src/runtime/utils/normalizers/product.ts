export interface NormalizedProduct {
  id: number
  sku: string
  title: string
  description?: string
  price?: number
  images: string[]
  type: string
}

export function normalizeProduct(p: any): NormalizedProduct {
  const descriptionAttr = (p.custom_attributes || []).find(
    (a: any) => a.attribute_code === 'description'
  )

  return {
    id: p.id,
    sku: p.sku,
    title: p.name,
    description: descriptionAttr?.value,
    price: p.price,
    images: (p.media_gallery_entries || []).map((i: any) => i.file),
    type: p.type_id
  }
}
