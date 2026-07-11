import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function usePOS() {
  const client = getCommerceClient() as CommerceClient

  async function listRegisters(opts: Record<string, unknown> = {}) {
    return client.listRegisters(opts)
  }

  async function createPosOrder(payload: Record<string, unknown>) {
    return client.createPosOrder(payload)
  }

  return {
    listRegisters,
    createPosOrder,
  }
}

export default usePOS
