import { getCommerceClient } from '../../utils/client'
import type { SfCompanyAccount } from '~/composables/system/models'

export function useCompanyAccounts() {
	const client = getCommerceClient()

	async function listCompanyAccounts(params: Record<string, any> = {}): Promise<SfCompanyAccount[]> {
		if (client && typeof client.listCompanyAccounts === 'function') {
			return client.listCompanyAccounts(params) as Promise<SfCompanyAccount[]>
		}
		return []
	}

	async function getCompanyAccountById(id: string): Promise<SfCompanyAccount | null> {
		if (client && typeof client.getCompanyAccountById === 'function') {
			return client.getCompanyAccountById(id) as Promise<SfCompanyAccount>
		}
		return null
	}

	async function createCompanyAccount(data: Partial<SfCompanyAccount>) {
		if (client && typeof client.createCompanyAccount === 'function') {
			return client.createCompanyAccount(data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updateCompanyAccount(id: string, data: Partial<SfCompanyAccount>) {
		if (client && typeof client.updateCompanyAccount === 'function') {
			return client.updateCompanyAccount(id, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function deleteCompanyAccount(id: string) {
		if (client && typeof client.deleteCompanyAccount === 'function') {
			return client.deleteCompanyAccount(id)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listCompanyAccounts,
		getCompanyAccountById,
		createCompanyAccount,
		updateCompanyAccount,
		deleteCompanyAccount
	}
}

export default useCompanyAccounts
