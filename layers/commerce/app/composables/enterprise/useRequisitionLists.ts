import { getCommerceClient } from '../../utils/client'
import type { SfRequisitionList, SfRequisitionListItem } from '~/composables/system/models'

export function useRequisitionLists() {
	const client = getCommerceClient()

	async function listRequisitionLists(customerId: string): Promise<SfRequisitionList[]> {
		if (client && typeof client.listRequisitionLists === 'function') {
			return client.listRequisitionLists(customerId) as Promise<SfRequisitionList[]>
		}
		return []
	}

	async function getRequisitionListById(id: string): Promise<SfRequisitionList | null> {
		if (client && typeof client.getRequisitionListById === 'function') {
			return client.getRequisitionListById(id) as Promise<SfRequisitionList>
		}
		return null
	}

	async function createRequisitionList(customerId: string, data: Partial<SfRequisitionList>) {
		if (client && typeof client.createRequisitionList === 'function') {
			return client.createRequisitionList(customerId, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updateRequisitionList(id: string, data: Partial<SfRequisitionList>) {
		if (client && typeof client.updateRequisitionList === 'function') {
			return client.updateRequisitionList(id, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function deleteRequisitionList(id: string) {
		if (client && typeof client.deleteRequisitionList === 'function') {
			return client.deleteRequisitionList(id)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function addRequisitionListItem(listId: string, item: SfRequisitionListItem) {
		if (client && typeof client.addRequisitionListItem === 'function') {
			return client.addRequisitionListItem(listId, item)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listRequisitionLists,
		getRequisitionListById,
		createRequisitionList,
		updateRequisitionList,
		deleteRequisitionList,
		addRequisitionListItem,
	}
}

export default useRequisitionLists
