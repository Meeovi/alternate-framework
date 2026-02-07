// src/adapter/index.ts
import {
  CommerceAdapter,
} from '@mframework/core'

import {
  createMagentoClient,
  MagentoClientOptions,
} from '../client'
import { safeCall } from '../errors'
import { mapMagentoProduct } from '../mappers/product'
import { mapMagentoCart } from '../mappers/cart'
import { mapMagentoCategory } from '../mappers/category'

export interface MagentoAdapterOptions extends MagentoClientOptions {}

export function createMagentoCommerceAdapter(
  options: MagentoAdapterOptions,
): CommerceAdapter {
  const client: any = createMagentoClient(options)

  return {
    async getProductBySlug(slug) {
      return safeCall(async () => {
        const data = await client.GetProductBySlug({ slug })
        const item = data?.products?.items?.[0]
        return item ? mapMagentoProduct(item) : null
      })
    },

    async getProducts(params) {
      return safeCall(async () => {
        const data = await client.GetProducts({
          search: params.search ?? '',
          categoryId: params.categoryId ?? null,
          pageSize: params.limit ?? 20,
          currentPage: (params.offset ?? 0) / (params.limit ?? 20) + 1,
        })

        return (data?.products?.items ?? []).map(mapMagentoProduct)
      })
    },

    async getCategoryTree() {
      return safeCall(async () => {
        const data = await client.GetCategoryTree({})
        return (data?.categories?.items ?? []).map(mapMagentoCategory)
      })
    },

    async getCart(cartId) {
      if (!cartId) return null

      return safeCall(async () => {
        const data = await client.GetCart({ cartId })
        return data?.cart ? mapMagentoCart(data.cart) : null
      })
    },

    async addToCart(cartId, input) {
      return safeCall(async () => {
        const effectiveCartId =
          cartId ?? (await client.CreateCart()).createEmptyCart

        const data = await client.AddToCart({
          cartId: effectiveCartId,
          sku: input.productId,
          quantity: input.quantity,
        })

        return mapMagentoCart(data.cart)
      })
    },
  }
}