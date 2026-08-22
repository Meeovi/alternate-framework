import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfRecommendation } from '../system/models'

export function useRecommendations() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    getRecommendations: (c, context: Record<string, any> = {}) => c.getRecommendations(context),
    getRecommendationRules: (c, productId: string) => c.getRecommendationRules({ productId }),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useRecommendations
