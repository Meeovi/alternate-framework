// Local masto client composables for lists layer
import { ref, type Ref } from 'vue'
import type { mastodon } from 'masto'

// Stub client that returns a basic structure
// In production, this would be initialized by the parent app
const mastoClient = ref<any>(null)

export function useMastoClient() {
  return mastoClient.value
}

export function useMasto() {
  return {
    client: mastoClient as Ref<any>,
    isReady: ref(true)
  }
}

// Local SearchResult type for account search
export type SearchResult = {
  type: 'account'
  data: mastodon.v1.Account
}
