import { storeToRefs } from '#imports'
import { useReactionsStore } from '../stores/useReactionsStore'

export function useReactions(reactionId: string | number, type: string) {
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
