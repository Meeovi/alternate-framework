import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfRecommendation } from '~/composables/system/models'

export function useRecommendations() {
  const client = getCommerceClient() as CommerceClient

  async function getRecommendations(context: Record<string, any> = {}): Promise<SfRecommendation[]> {
    return client.getRecommendations(context)
  }

  async function getRecommendationRules(productId: string) {
    return client.getRecommendationRules({ productId })
  }

  return {
    getRecommendations,
    getRecommendationRules,
  }
}

export default useRecommendations
