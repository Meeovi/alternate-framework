import { defineStore } from '#imports'
import { ref } from 'vue'

type ReactionItem = { likeCount: number; isLiked: boolean; loading: boolean }
type Items = Record<string | number, ReactionItem>

export const useReactionsStore = defineStore('reactions', () => {
  const items = ref<Items>({})
  const { user } = useAuth()

  async function fetchReactionsApi(
    reactionId: string | number,
    type: string,
    userId?: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    const params = new URLSearchParams({
      reactionId: String(reactionId),
      type,
      ...(userId ? { userId } : {}),
    })
    const res = await fetch(`/api/social/reactions?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to fetch reactions')
    return res.json()
  }

  async function toggleReactionApi(
    reactionId: string | number,
    type: string,
    userId?: string
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    const res = await fetch('/api/social/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionId, type, ...(userId ? { userId } : {}) }),
    })
    if (!res.ok) throw new Error('Failed to toggle reaction')
    return res.json()
  }

  async function fetchReactions(reactionId: string | number, type: string) {
    if (!reactionId) return
    items.value[reactionId] = items.value[reactionId] || { likeCount: 0, isLiked: false, loading: true }
    try {
      const data = await fetchReactionsApi(reactionId, type, user.value?.id)
      items.value[reactionId] = {
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        loading: false,
      }
    } catch (_e) {
      items.value[reactionId].loading = false
    }
  }

  async function toggleReaction(reactionId: string | number, type: string) {
    if (!reactionId) return
    items.value[reactionId] = items.value[reactionId] || { likeCount: 0, isLiked: false, loading: false }
    items.value[reactionId].loading = true
    try {
      const data = await toggleReactionApi(reactionId, type, user.value?.id)
      items.value[reactionId] = {
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        loading: false,
      }
    } catch (_e) {
      items.value[reactionId].loading = false
    }
  }

  function getItem(reactionId: string | number, _type?: string): ReactionItem {
    return items.value[reactionId] || { likeCount: 0, isLiked: false, loading: false }
  }

  return {
    items,
    fetchReactions,
    toggleReaction,
    getItem,
  }
})
