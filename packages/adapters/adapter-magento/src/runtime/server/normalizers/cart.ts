export interface NormalizedCartItem {
  sku: string
  name: string
  qty: number
  price: number
}

export interface NormalizedCart {
  id: number | string
  items: NormalizedCartItem[]
  total: number
}

export function normalizeCartREST(raw: any): NormalizedCart {
  return {
    id: raw.id,
    items: raw.items?.map((item) => ({
      sku: item.sku,
      name: item.name,
      qty: item.qty,
      price: item.price,
    })) || [],
    total: raw.base_grand_total,
  }
}
