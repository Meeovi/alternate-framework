import { getCommerceClient } from '../../utils/client'

export function useCompanyAccounts() {
	const client = getCommerceClient()

	async function listCompanyAccounts(params = {}) {
		if (client && typeof client.listCompanyAccounts === 'function') {
			return client.listCompanyAccounts(params)
		}
		return []
	}

	async function getCompanyAccountById(id: string) {
		if (client && typeof client.getCompanyAccountById === 'function') {
			return client.getCompanyAccountById(id)
		}
		return null
	}

	async function createCompanyAccount(data: Record<string, any>) {
		if (client && typeof client.createCompanyAccount === 'function') {
			return client.createCompanyAccount(data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updateCompanyAccount(id: string, data: Record<string, any>) {
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
