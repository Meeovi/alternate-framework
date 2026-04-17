import { getCommerceClient } from '../../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useReturns() {
	const client = clientOrNull()

	async function getReturns(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listReturns === 'function') return client.listReturns(opts)
		return []
	}

	async function getReturnById(id: string) {
		if (client && typeof client.getReturn === 'function') return client.getReturn(id)
		const returns = await getReturns()
		return Array.isArray(returns) ? returns.find((item: any) => item?.id === id) || null : null
	}

	async function createReturn(payload: Record<string, unknown>) {
		if (client && typeof client.createReturn === 'function') return client.createReturn(payload)
		return null
	}

	return {
		getReturns,
		getReturnById,
		createReturn,
	}
}

export default useReturns
