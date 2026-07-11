import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export interface SendToFriendPayload {
  productId: string
  friendEmail: string
  message?: string
  senderName?: string
}

export interface SendToFriendResult {
  success: boolean
  message?: string
  error?: string
}

export function useSendToAFriendFeature() {
  const client = getCommerceClient() as CommerceClient

  async function sendToAFriend(payload: SendToFriendPayload): Promise<void> {
    return client.sendToAFriend(payload)
  }

  async function sendRecommendation(payload: {
    productId?: string
    email?: string
    message?: string
    senderName?: string
  }): Promise<void> {
    return client.sendRecommendation(payload)
  }

  return {
    sendToAFriend,
    sendRecommendation,
  }
}

export default useSendToAFriendFeature
