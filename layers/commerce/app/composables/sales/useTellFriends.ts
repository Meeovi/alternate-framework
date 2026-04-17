import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useTellFriends() {
	const client = clientOrNull()

	async function sendRecommendation(payload: {
		productId?: string
		email?: string
		message?: string
		senderName?: string
	}) {
		if (client && typeof client.tellAFriend === 'function') return client.tellAFriend(payload)
		if (client && typeof client.sendRecommendation === 'function') return client.sendRecommendation(payload)
		return { success: false, reason: 'tellAFriend not implemented by provider' }
	}

	return {
		sendRecommendation,
	}
}

export default useTellFriends
