import { createCrudResource } from './useEnterpriseResource'

export const useRequisitionLists = () =>
  createCrudResource('requisitionList', {
    addRequisitionListItem: (client, listId, item) =>
      client.addRequisitionListItem({ listId, item }),
  })
export default useRequisitionLists
