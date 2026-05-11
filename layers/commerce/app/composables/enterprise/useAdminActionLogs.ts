import { getCommerceClient } from '../../utils/client'

export function useAdminActionLogs() {
	const client = getCommerceClient()

	async function listAdminActionLogs(params = {}) {
		if (client && typeof client.listAdminActionLogs === 'function') {
			return client.listAdminActionLogs(params)
		}
		return []
	}

	return {
		listAdminActionLogs
	}
}

export default useAdminActionLogs
