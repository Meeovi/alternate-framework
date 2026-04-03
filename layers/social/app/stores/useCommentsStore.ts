import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommentsStore = defineStore('comments', () => {
  const channelName = ref(null)
  const iframeUrl = ref(null)

  // Fetch channel name from backend
  async function loadChannel(contentId) {
    try {
      const data = await $fetch(`/api/comments/channel/${contentId}`)
      channelName.value = data.channelName
      iframeUrl.value = `https://chat.meeovicms.com/channel/${channelName.value}`
    } catch (err) {
      console.error('Failed to load channel', err)
    }
  }

  return { channelName, iframeUrl, loadChannel }
})