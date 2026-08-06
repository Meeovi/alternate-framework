import { createCrudResource } from './useEnterpriseResource'

export const usePurchaseOrderApprovalRules = () =>
  createCrudResource('approvalRule', {
    listApprovalRules: (client, companyId) => client.listApprovalRules({ companyId }),
  })
export default usePurchaseOrderApprovalRules
