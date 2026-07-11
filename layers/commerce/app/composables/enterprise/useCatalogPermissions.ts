import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfPermission, SfRole } from '~/composables/system/models'

export function useCatalogPermissions() {
  const client = getCommerceClient() as CommerceClient

  async function getCatalogPermissions(userId: string): Promise<SfPermission[]> {
    return client.getCatalogPermissions(userId)
  }

  async function getUserRoles(userId: string): Promise<SfRole[]> {
    return client.getUserRoles(userId)
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
