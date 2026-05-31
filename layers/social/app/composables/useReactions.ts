import { storeToRefs } from 'pinia'
import { useReactionsStore } from '../stores/useReactionsStore'

export function useReactions(reactionId, type) {
  const store = useReactionsStore()
  const { getItem } = storeToRefs(store)

  function fetch() {
    return store.fetchReactions(reactionId, type)
  }

  function toggle() {
    return store.toggleReaction(reactionId, type)
  }

  return {
    reaction: store.getItem(reactionId, type),
    fetch,
    toggle
  }
}
