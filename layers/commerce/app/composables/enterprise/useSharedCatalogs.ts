import { getCommerceClient } from '../../utils/client'
import type { SfSharedCatalog } from '~/composables/system/models'

export function useSharedCatalogs() {
	const client = getCommerceClient()

	async function listSharedCatalogs(params: Record<string, any> = {}): Promise<SfSharedCatalog[]> {
		if (client && typeof client.listSharedCatalogs === 'function') {
			return client.listSharedCatalogs(params) as Promise<SfSharedCatalog[]>
		}
		return []
	}

	async function getSharedCatalogById(id: string): Promise<SfSharedCatalog | null> {
		if (client && typeof client.getSharedCatalogById === 'function') {
			return client.getSharedCatalogById(id) as Promise<SfSharedCatalog>
		}
		const catalogs = await listSharedCatalogs()
		return Array.isArray(catalogs) ? catalogs.find((catalog: any) => catalog?.id === id) || null : null
	}

	return {
		listSharedCatalogs,
		getSharedCatalogById,
	}
}

export default useSharedCatalogs
