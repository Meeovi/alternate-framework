import { getCommerceClient } from '../utils/client'

export function useContentFallback() {
  const client = getCommerceClient()
  return {
    adapter: client,
    async listShops(params?: Record<string, unknown>) {
      if (client && typeof (client as any).listShops === 'function') return (client as any).listShops(params)
      return []
    },
    async listBrands(params?: Record<string, unknown>) {
      if (client && typeof (client as any).listBrands === 'function') return (client as any).listBrands(params)
      return []
    },
    async getBrandBySlug(slug: string) {
      if (client && typeof (client as any).getBrandBySlug === 'function') return (client as any).getBrandBySlug(slug)
      return null
    },
    async getPage(id: string) {
      if (client && typeof (client as any).getPage === 'function') return (client as any).getPage(id)
      return null
    }
  }
}

export default useContentFallback
