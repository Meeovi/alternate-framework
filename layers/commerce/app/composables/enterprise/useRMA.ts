import { getCommerceClient } from '../../utils/client'
import type { SfRMARequest, SfRMAItem } from '~/composables/system/models'

export function useRMA() {
	const client = getCommerceClient()

	async function createRMA(orderId: string, items: SfRMAItem[]): Promise<SfRMARequest | null> {
		if (client && typeof client.createRMA === 'function') {
			return client.createRMA({
				orderId,
				items,
			}) as Promise<SfRMARequest>
		}
		return null
	}

	async function getReturns(opts: Record<string, any> = {}): Promise<SfRMARequest[]> {
		if (client && typeof client.listReturns === 'function') {
			return client.listReturns(opts) as Promise<SfRMARequest[]>
		}
		return []
	}

	async function getReturnById(id: string): Promise<SfRMARequest | null> {
		if (client && typeof client.getReturn === 'function') {
			return client.getReturn(id) as Promise<SfRMARequest>
		}
		const returns = await getReturns()
		return Array.isArray(returns) ? returns.find((item: any) => item?.id === id) || null : null
	}

	return {
		createRMA,
		getReturns,
		getReturnById
	}
}

export default useRMA
