import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function usePOS() {
	const client = clientOrNull()

	async function listRegisters(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listRegisters === 'function') return client.listRegisters(opts)
		return []
	}

	async function createPosOrder(payload: Record<string, unknown>) {
		if (client && typeof client.createPosOrder === 'function') return client.createPosOrder(payload)
		if (client && typeof client.createOrder === 'function') return client.createOrder({ ...payload, source: 'pos' })
		return null
	}

	return {
		listRegisters,
		createPosOrder,
	}
}

export default usePOS
