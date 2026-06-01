import { defineStore } from '#imports'
import { ref } from 'vue'
import { useAuth } from '#auth/app/composables/useAuth'
import { useContent } from '#shared/app/composables/content/useContent'

export const useReactionsStore = defineStore('reactions', () => {
  const items = ref({}) // { [reactionId]: { likeCount, isLiked, loading } }
  const user = useAuth().user
  const { fetchReactionsApi, toggleReactionApi } = useContent()

  async function fetchReactions(reactionId, type) {
    if (!reactionId) return
    items.value[reactionId] = items.value[reactionId] || { likeCount: 0, isLiked: false, loading: true }
    try {
      const data = await fetchReactionsApi(reactionId, type, user.value?.id)
      items.value[reactionId] = {
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        loading: false
      }
    } catch (e) {
      items.value[reactionId].loading = false
    }
  }

  async function toggleReaction(reactionId, type) {
    if (!reactionId) return
    items.value[reactionId] = items.value[reactionId] || { likeCount: 0, isLiked: false, loading: false }
    items.value[reactionId].loading = true
    try {
      const data = await toggleReactionApi(reactionId, type, user.value?.id)
      items.value[reactionId] = {
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        loading: false
      }
    } catch (e) {
      items.value[reactionId].loading = false
    }
  }

  function getItem(reactionId, type) {
    return items.value[reactionId] || { likeCount: 0, isLiked: false, loading: false }
  }

  return {
    items,
    fetchReactions,
    toggleReaction,
    getItem
  }
})
