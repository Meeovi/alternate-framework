import { getCommerceClient } from '../../utils/client'
import type { SfPermission, SfRole } from '~/composables/system/models'

export interface CatalogPermission {
  id: string
  code: string
  name: string
  category: string
  description?: string
}

export function useCatalogPermissions() {
	const client = getCommerceClient()

	async function getCatalogPermissions(userId: string): Promise<SfPermission[]> {
		if (client && typeof client.getCatalogPermissions === 'function') {
			return client.getCatalogPermissions(userId) as Promise<SfPermission[]>
		}
		return []
	}

	async function getUserRoles(userId: string): Promise<SfRole[]> {
		if (client && typeof client.getUserRoles === 'function') {
			return client.getUserRoles(userId) as Promise<SfRole[]>
		}
		return []
	}

	async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
		const permissions = await getCatalogPermissions(userId)
		return Array.isArray(permissions) ? permissions.some((p: any) => p.code === permissionCode) : false
	}

	return {
		getCatalogPermissions,
		getUserRoles,
		hasPermission,
	}
}

export default useCatalogPermissions
