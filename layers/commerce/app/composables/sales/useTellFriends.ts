import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useTellFriends() {
  const client = getCommerceClient() as CommerceClient

  async function sendRecommendation(payload: {
    productId?: string
    email?: string
    message?: string
    senderName?: string
  }) {
    return client.sendRecommendation(payload)
  }

  return {
    sendRecommendation,
  }
}

export default useTellFriends
