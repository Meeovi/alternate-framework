import { getCommerceClient } from '../../utils/client'
import type { SfCompanyAccount } from '~/composables/system/models'

export function usePurchaseOrderApprovalRules() {
	const client = getCommerceClient()

	async function listApprovalRules(companyId: string) {
		if (client && typeof client.listApprovalRules === 'function') {
			return client.listApprovalRules(companyId)
		}
		return []
	}

	async function createApprovalRule(companyId: string, data: Record<string, any>) {
		if (client && typeof client.createApprovalRule === 'function') {
			return client.createApprovalRule(companyId, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updateApprovalRule(id: string, data: Record<string, any>) {
		if (client && typeof client.updateApprovalRule === 'function') {
			return client.updateApprovalRule(id, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function deleteApprovalRule(id: string) {
		if (client && typeof client.deleteApprovalRule === 'function') {
			return client.deleteApprovalRule(id)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listApprovalRules,
		createApprovalRule,
		updateApprovalRule,
		deleteApprovalRule,
	}
}

export default usePurchaseOrderApprovalRules
