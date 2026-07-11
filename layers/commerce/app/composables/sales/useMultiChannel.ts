import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useMultiChannel(initialChannel?: string) {
  const client = getCommerceClient() as CommerceClient
  const activeChannel = ref(initialChannel || 'default')

  async function listChannels() {
    return client.listChannels()
  }

  async function setChannel(channel: string) {
    activeChannel.value = channel
    await client.setChannel(channel)
    return activeChannel.value
  }

  function getCurrentChannel() {
    return activeChannel.value
  }

  return {
    activeChannel,
    listChannels,
    setChannel,
    getCurrentChannel,
  }
}

export default useMultiChannel
