export interface NormalizedCart {
  id: string | number
  items: Array<{
    id: number
    sku: string
    qty: number
    name: string
    price: number
  }>
  totals?: any
}

export function normalizeCart(c: any): NormalizedCart {
  return {
    id: c.id ?? c.cart_id ?? c.quote_id,
    items: (c.items || []).map((i: any) => ({
      id: i.item_id,
      sku: i.sku,
      qty: i.qty,
      name: i.name,
      price: i.price
    })),
    totals: c.totals
  }
}
