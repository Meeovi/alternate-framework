import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfProduct } from '~/composables/system/models'

export function useSensei() {
  const client = getCommerceClient() as CommerceClient

  async function getSenseiRecommendations(context: Record<string, any> = {}): Promise<SfProduct[]> {
    return client.getSenseiRecommendations(context)
  }

  async function getProductRecommendations(productId: string, limit = 4) {
    return client.getProductRecommendations(productId, limit)
  }

  return {
    getSenseiRecommendations,
    getProductRecommendations,
  }
}

export default useSensei
