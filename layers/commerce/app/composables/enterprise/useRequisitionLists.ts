import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfRequisitionList, SfRequisitionListItem } from '~/composables/system/models'

export function useRequisitionLists() {
  const client = getCommerceClient() as CommerceClient

  async function listRequisitionLists(customerId: string): Promise<SfRequisitionList[]> {
    return client.listRequisitionLists({ customerId })
  }

  async function getRequisitionListById(id: string): Promise<SfRequisitionList | null> {
    return client.getRequisitionListById(id)
  }

  async function createRequisitionList(customerId: string, data: Partial<SfRequisitionList>) {
    return client.createRequisitionList({ customerId, ...data })
  }

  async function updateRequisitionList(id: string, data: Partial<SfRequisitionList>) {
    return client.updateRequisitionList({ id, ...data })
  }

  async function deleteRequisitionList(id: string) {
    return client.deleteRequisitionList(id)
  }

  async function addRequisitionListItem(listId: string, item: SfRequisitionListItem) {
    return client.addRequisitionListItem({ listId, item })
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
