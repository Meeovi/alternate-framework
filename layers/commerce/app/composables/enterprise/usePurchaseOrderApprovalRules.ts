import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function usePurchaseOrderApprovalRules() {
  const client = getCommerceClient() as CommerceClient

  async function listApprovalRules(companyId: string) {
    return client.listApprovalRules({ companyId })
  }

  async function createApprovalRule(companyId: string, data: Record<string, any>) {
    return client.createApprovalRule({ companyId, ...data })
  }

  async function updateApprovalRule(id: string, data: Record<string, any>) {
    return client.updateApprovalRule({ id, ...data })
  }

  async function deleteApprovalRule(id: string) {
    return client.deleteApprovalRule(id)
  }

  return {
    listApprovalRules,
    createApprovalRule,
    updateApprovalRule,
    deleteApprovalRule,
  }
}

export default usePurchaseOrderApprovalRules
