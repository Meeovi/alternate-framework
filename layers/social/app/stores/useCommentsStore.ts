
export const useCommentsStore = defineStore('comments', {
  state: () => ({
    iframeUrl: '',
    channelName: '',
  }),
  actions: {
    loadChannel(contentId: string | number | Record<string, unknown>) {
      const id = typeof contentId === 'object' ? JSON.stringify(contentId) : String(contentId)
      this.channelName = `content-${id}`
      this.iframeUrl = ''
    },
  },
})
