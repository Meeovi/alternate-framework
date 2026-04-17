import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useCreditMemo() {
	const client = clientOrNull()

	async function getCreditMemos(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listCreditMemos === 'function') return client.listCreditMemos(opts)
		return []
	}

	async function getCreditMemoById(id: string) {
		if (client && typeof client.getCreditMemo === 'function') return client.getCreditMemo(id)
		return null
	}

	return {
		getCreditMemos,
		getCreditMemoById,
	}
}

export default useCreditMemo
