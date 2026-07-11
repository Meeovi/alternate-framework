import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useAdminActionLogs() {
  const client = getCommerceClient() as CommerceClient

  async function listAdminActionLogs(params = {}) {
    return client.listAdminActionLogs(params)
  }

  return {
    listAdminActionLogs,
  }
}

export default useAdminActionLogs
