import { ref, watchEffect } from 'vue'
import { getCommerceClient } from '../utils/client'

export function useCatalogFallback() {
  // Prefer the generic commerce client provided by an adapter or the SDK
  const client = getCommerceClient()
  return {
    adapter: client,
    async getProductById(id: string) {
      if (client && typeof (client as any).getProductById === 'function') return (client as any).getProductById(id)
      return null
    },
    async getProductBySlug(slug: string) {
      if (client && typeof (client as any).getProductBySlug === 'function') return (client as any).getProductBySlug(slug)
      return null
    },
    async listProducts(params?: Record<string, unknown>) {
      if (client && typeof (client as any).listProducts === 'function') return (client as any).listProducts(params)
      return []
    },
    async listAttributes(filter?: Record<string, unknown>) {
      if (client && typeof (client as any).listAttributes === 'function') return (client as any).listAttributes(filter)
      return []
    }
  }
}
