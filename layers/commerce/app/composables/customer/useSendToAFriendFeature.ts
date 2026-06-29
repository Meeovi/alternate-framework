import { getCommerceClient } from '../../utils/client'
import type { SfProduct } from '~/composables/system/models'

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
	const client = getCommerceClient()

	async function sendToAFriend(payload: SendToFriendPayload): Promise<SendToFriendResult> {
		if (client && typeof client.sendToAFriend === 'function') {
			return client.sendToAFriend(payload) as Promise<SendToFriendResult>
		}
		if (client && typeof client.tellAFriend === 'function') {
			return client.tellAFriend(payload) as Promise<SendToFriendResult>
		}
		return { success: false, error: 'Not implemented' }
	}

	async function sendRecommendation(payload: {
		productId?: string
		email?: string
		message?: string
		senderName?: string
	}): Promise<SendToFriendResult> {
		if (client && typeof client.sendRecommendation === 'function') {
			return client.sendRecommendation(payload) as Promise<SendToFriendResult>
		}
		return { success: false, error: 'Not implemented' }
	}

	return {
		sendToAFriend,
		sendRecommendation
	}
}

export default useSendToAFriendFeature
