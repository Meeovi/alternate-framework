import { createNormalizer } from '@meeovi/normalizer-core'
import { validate, validators, optional } from '@meeovi/normalizer-core'
import type { CartItemGQL } from '../../types/graphql'

export interface NormalizedCartItem {
  id: number
  sku: string
  qty: number
  name: string
  price: number
}

export interface NormalizedCart {
  id: string | number
  items: NormalizedCartItem[]
  totals?: any
}

const cartSchema = {
  id: validators.string as any,
  items: validators.array((item: any) =>
    validate<NormalizedCartItem>(
      {
        id: validators.number,
        sku: validators.string,
        qty: validators.number,
        name: validators.string,
        price: validators.number
      } as any,
      item
    )
  ),
  totals: optional(validators.json)
}

export const normalizeCart = createNormalizer<CartItemGQL[] | any, NormalizedCart>((c) => {
  const mapped = {
    id: c.id ?? c.cart_id ?? c.quote_id,
    items: (c.items || []).map((i: any) => ({
      id: i.item_id ?? Number(i.id),
      sku: i.sku,
      qty: i.qty ?? i.quantity,
      name: i.name,
      price: i.price ?? (i.prices?.price?.value ?? 0)
    })),
    totals: c.totals
  }

  // normalize id to string for schema validator convenience
  const normalizedForValidation = { ...mapped, id: String(mapped.id) }
  return validate<NormalizedCart>(cartSchema as any, normalizedForValidation)
})
