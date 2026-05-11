import { getCommerceClient } from '../../utils/client'

export function usePurchaseOrderApprovalRules() {
	const client = getCommerceClient()

	async function listApprovalRules(companyId: string) {
		if (client && typeof client.listApprovalRules === 'function') {
			return client.listApprovalRules(companyId)
		}
		return []
	}

	return { listApprovalRules }
}

export default usePurchaseOrderApprovalRules
