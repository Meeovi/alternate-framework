// layers/social/stores/social.ts
import { defineStore } from '#imports'

export const useSocialStore = defineStore('social', () => {
  // Local cache map tracking follow states across items dynamically: { "targetId": true/false }
  const followRegistry = ref<Record<string, boolean>>({})

  async function toggleFollow(targetId: string, targetType: string) {
    try {
      const data = await $fetch('/api/social/follow', {
        method: 'POST',
        body: { targetId, targetType }
      })
      
      // Update store reactivity seamlessly
      followRegistry.value[targetId] = data.following
    } catch (error) {
      console.error('Failed to toggle follow status:', error)
    }
  }

  const isFollowing = (targetId: string) => computed(() => !!followRegistry.value[targetId])

  return {
    followRegistry,
    toggleFollow,
    isFollowing
  }
})