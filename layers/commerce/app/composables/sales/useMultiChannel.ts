import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useMultiChannel(initialChannel?: string) {
	const client = clientOrNull()
	const activeChannel = ref(initialChannel || 'default')

	async function listChannels() {
		if (client && typeof client.listChannels === 'function') return client.listChannels()
		if (client && typeof client.getStores === 'function') return client.getStores()
		return [{ code: activeChannel.value, name: activeChannel.value }]
	}

	async function setChannel(channel: string) {
		activeChannel.value = channel
		if (client && typeof client.setChannel === 'function') {
			await client.setChannel(channel)
		}
		return activeChannel.value
	}

	function getCurrentChannel() {
		return activeChannel.value
	}

	return {
		activeChannel,
		listChannels,
		setChannel,
		getCurrentChannel,
	}
}

export default useMultiChannel
