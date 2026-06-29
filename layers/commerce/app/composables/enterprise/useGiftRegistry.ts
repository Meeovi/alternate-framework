import { getCommerceClient } from '../../utils/client'
import type { SfGiftRegistry, SfGiftRegistryItem } from '~/composables/system/models'

export function useGiftRegistry() {
	const client = getCommerceClient()

	async function listGiftRegistries(params: Record<string, any> = {}): Promise<SfGiftRegistry[]> {
		if (client && typeof client.listGiftRegistries === 'function') {
			return client.listGiftRegistries(params) as Promise<SfGiftRegistry[]>
		}
		return []
	}

	async function getGiftRegistryById(id: string): Promise<SfGiftRegistry | null> {
		if (client && typeof client.getGiftRegistryById === 'function') {
			return client.getGiftRegistryById(id) as Promise<SfGiftRegistry>
		}
		const registries = await listGiftRegistries()
		return Array.isArray(registries) ? registries.find((registry: any) => registry?.id === id) || null : null
	}

	async function createGiftRegistry(data: Partial<SfGiftRegistry>) {
		if (client && typeof client.createGiftRegistry === 'function') {
			return client.createGiftRegistry(data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function updateGiftRegistry(id: string, data: Partial<SfGiftRegistry>) {
		if (client && typeof client.updateGiftRegistry === 'function') {
			return client.updateGiftRegistry(id, data)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function addGiftRegistryItem(registryId: string, item: SfGiftRegistryItem) {
		if (client && typeof client.addGiftRegistryItem === 'function') {
			return client.addGiftRegistryItem(registryId, item)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function removeGiftRegistryItem(itemId: string) {
		if (client && typeof client.removeGiftRegistryItem === 'function') {
			return client.removeGiftRegistryItem(itemId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		listGiftRegistries,
		getGiftRegistryById,
		createGiftRegistry,
		updateGiftRegistry,
		addGiftRegistryItem,
		removeGiftRegistryItem,
	}
}

export default useGiftRegistry
