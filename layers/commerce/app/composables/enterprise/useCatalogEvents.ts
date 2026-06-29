import { getCommerceClient } from '../../utils/client'
import type { SfEvent } from '~/composables/system/models'

export interface CatalogEvent {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  type?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useCatalogEvents() {
	const client = getCommerceClient()

	async function listCatalogEvents(params: Record<string, any> = {}): Promise<SfEvent[]> {
		if (client && typeof client.listCatalogEvents === 'function') {
			return client.listCatalogEvents(params) as Promise<SfEvent[]>
		}
		return []
	}

	async function getCatalogEventById(id: string): Promise<SfEvent | null> {
		if (client && typeof client.getCatalogEventById === 'function') {
			return client.getCatalogEventById(id) as Promise<SfEvent>
		}
		const events = await listCatalogEvents()
		return Array.isArray(events) ? events.find((event: any) => event?.id === id) || null : null
	}

	return {
		listCatalogEvents,
		getCatalogEventById,
	}
}

export default useCatalogEvents
