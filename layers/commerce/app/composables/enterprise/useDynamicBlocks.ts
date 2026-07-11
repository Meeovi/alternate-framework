import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfDynamicBlock } from '~/composables/system/models'

export function useDynamicBlocks() {
  const client = getCommerceClient() as CommerceClient

  async function getDynamicBlockById(id: string): Promise<SfDynamicBlock | null> {
    return client.getDynamicBlockById(id)
  }

  async function listDynamicBlocks(params: Record<string, any> = {}): Promise<SfDynamicBlock[]> {
    return client.listDynamicBlocks(params)
  }

  return {
    getDynamicBlockById,
    listDynamicBlocks,
  }
}

export default useDynamicBlocks
