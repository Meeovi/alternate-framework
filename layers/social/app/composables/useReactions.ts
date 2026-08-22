import { useReactionsStore } from '../stores/useReactionsStore'

export function useReactions(reactionId: string | number, type: string) {
  const store = useReactionsStore()

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
