import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfProduct } from '../system/models'

export function useSensei() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    getSenseiRecommendations: (c, context: Record<string, any> = {}) => c.getSenseiRecommendations(context),
    getProductRecommendations: (c, productId: string, limit = 4) =>
      c.getProductRecommendations(productId, limit),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useSensei
