import type { MyBackend_Product } from '../graphql/types'

export function normalizeProduct(data: MyBackend_Product) {
  return {
    id: data.id,
    title: data.name,
    image: data.image_url,
    price: Number(data.price)
  }
}
