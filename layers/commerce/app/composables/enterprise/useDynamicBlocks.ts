import { getCommerceClient } from '../../utils/client'
import type { SfDynamicBlock } from '~/composables/system/models'

export function useDynamicBlocks() {
	const client = getCommerceClient()

	async function getDynamicBlockById(id: string): Promise<SfDynamicBlock | null> {
		if (client && typeof client.getDynamicBlockById === 'function') {
			return client.getDynamicBlockById(id) as Promise<SfDynamicBlock>
		}
		return null
	}

	async function listDynamicBlocks(params: Record<string, any> = {}): Promise<SfDynamicBlock[]> {
		if (client && typeof client.listDynamicBlocks === 'function') {
			return client.listDynamicBlocks(params) as Promise<SfDynamicBlock[]>
		}
		return []
	}

	return {
		getDynamicBlockById,
		listDynamicBlocks
	}
}

export default useDynamicBlocks
