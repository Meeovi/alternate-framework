// packages/magento/src/runtime/server/utils/rest.ts

import { normalizeProductREST } from '../normalizers/product'
import { normalizeCategoryREST } from '../normalizers/category'
import { normalizeCartREST } from '../normalizers/cart'
import { normalizeCustomerREST } from '../normalizers/customer'
import type { MagentoRuntimeConfig } from './types'

export function createMagentoRestClient(config: MagentoRuntimeConfig, event: any) {
  const baseURL = config.url.replace(/\/$/, '')

  async function $(url: string, options: RequestInit = {}) {
    const res = await fetch(`${baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
        ...(options.headers || {}),
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        `Magento API error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`
      )
    }

    return res.json()
  }

  return {
    products: {
      list: async (params?: any) => {
        const res = await $('/rest/V1/products', { method: 'GET', query: params })
        return {
          items: res.items.map(normalizeProductREST),
          total: res.total_count,
        }
      },

      get: async (sku: string) =>
        normalizeProductREST(await $(`/rest/V1/products/${encodeURIComponent(sku)}`)),
    },

    categories: {
      list: async () => {
        const res = await $('/rest/V1/categories', { method: 'GET' })
        return res.map(normalizeCategoryREST)
      },
    },

    cart: {
      addItem: async (cartId: string | number, sku: string, quantity: number) => {
        const res = await $(`/rest/V1/carts/${cartId}/items`, {
          method: 'POST',
          body: JSON.stringify({
            cartItem: {
              quote_id: cartId,
              sku,
              qty: quantity,
            },
          }),
        })
        return normalizeCartREST(res)
      },
    },

    customer: {
      get: async (customerId: string | number) =>
        normalizeCustomerREST(await $(`/rest/V1/customers/${customerId}`)),

      create: async (customerData: any) =>
        normalizeCustomerREST(
          await $('/rest/V1/customers', {
            method: 'POST',
            body: JSON.stringify({ customer: customerData }),
          })
        ),
    },
  }
}
