// packages/magento/src/runtime/server/utils/graphql.ts

import { normalizeProductGraphQL } from '../normalizers/product'
import type { MagentoRuntimeConfig } from './types'

export function createMagentoGraphQLClient(config: MagentoRuntimeConfig, event: any) {
  const baseURL = config.url.replace(/\/$/, '')

  async function $(query: string, variables?: Record<string, any>) {
    const res = await fetch(`${baseURL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        `Magento GraphQL error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`
      )
    }

    return res.json()
  }

  return {
    query: async (query: string, variables?: Record<string, any>) => {
      const result = await $(query, variables)

      // Normalize products if present
      if (result?.data?.products) {
        return {
          ...result.data,
          products: {
            items: result.data.products.items.map(normalizeProductGraphQL),
            total: result.data.products.total_count,
          },
        }
      }

      return result.data
    },
  }
}
