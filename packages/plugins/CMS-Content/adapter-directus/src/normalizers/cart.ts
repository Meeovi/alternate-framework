import type { MyBackend_Cart } from '../graphql/types'

export function normalizeCart(data: MyBackend_Cart) {
  return {
    id: data.id,
    items: data.items,
    total: Number(data.total)
  }
}
