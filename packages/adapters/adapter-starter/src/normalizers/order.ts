import type { MyBackend_Order } from '../graphql/types'

export function normalizeOrder(data: MyBackend_Order) {
  return {
    id: data.id,
    status: data.status,
    total: Number(data.total)
  }
}
