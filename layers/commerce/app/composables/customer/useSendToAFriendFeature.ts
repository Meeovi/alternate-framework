import { getCommerceClient } from '../../utils/client'

export function useSendToAFriendFeature() {
	const client = getCommerceClient()

	async function sendToAFriend(productId: string, friendEmail: string, message: string) {
		if (client && typeof client.sendToAFriend === 'function') {
			return client.sendToAFriend(productId, friendEmail, message)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		sendToAFriend
	}
}

export default useSendToAFriendFeature
