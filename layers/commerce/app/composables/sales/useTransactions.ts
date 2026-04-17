import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useTransactions() {
	const client = clientOrNull()

	async function listTransactions(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listTransactions === 'function') return client.listTransactions(opts)
		return []
	}

	async function getTransactionById(id: string) {
		if (client && typeof client.getTransaction === 'function') return client.getTransaction(id)
		const transactions = await listTransactions()
		return Array.isArray(transactions)
			? transactions.find((transaction: any) => transaction?.id === id) || null
			: null
	}

	return {
		listTransactions,
		getTransactionById,
	}
}

export default useTransactions
