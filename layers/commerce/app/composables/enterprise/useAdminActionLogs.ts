import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useAdminActionLogs() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    listAdminActionLogs: (c, params = {}) => c.listAdminActionLogs(params),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useAdminActionLogs
