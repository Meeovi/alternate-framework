import { getCommerceClient } from '../../utils/client'

export function useRequisitionLists() {
	const client = getCommerceClient()

	async function listRequisitionLists(userId: string) {
		if (client && typeof client.listRequisitionLists === 'function') {
			return client.listRequisitionLists(userId)
		}
		return []
	}

	return { listRequisitionLists }
}

export default useRequisitionLists
