import { ref } from 'vue'
import { useAsyncData } from './core/vue'
import useContentAdapter from './useContentAdapter'

type MaybeRefId = { value: string | number | null | undefined }

export function useConnectFeedsData(currentUserId: MaybeRefId) {
  const { readOne, readMany, describeError } = useContentAdapter()
  const contentStatusMessage = ref('')

  function setContentError(error: any, label: string) {
    console.error(`Failed to load ${label}`, error)
    contentStatusMessage.value = describeError(error, { label })
  }

  async function safeReadItem(collection: string, id: string, opts: any, label: string) {
    try {
      return await readOne(collection, id, opts)
    } catch (error) {
      setContentError(error, label)
      return null
    }
  }

  async function safeReadItems(collection: string, opts: any, label: string) {
    try {
      return await readMany(collection, opts)
    } catch (error) {
      setContentError(error, label)
      return []
    }
  }

  const { data: feedBar, refresh: refreshFeedBar } = useAsyncData('feedBar', async () => {
    return await safeReadItem('navigation', '32', { fields: ['*', { '*': ['*'] }] }, 'feed navigation')
  }, {
    server: false,
    default: () => null,
  })

  const { data: feedsPage, refresh: refreshFeedsPage } = useAsyncData('feedsPage', async () => {
    return await safeReadItem('pages', '34', { fields: ['*', { '*': ['*'] }] }, 'feeds page')
  }, {
    server: false,
    default: () => null,
  })

  const { data: posts, refresh: refreshPosts } = useAsyncData('posts', async () => {
    return await safeReadItems('posts', {
      fields: ['*'],
      limit: 25,
      sort: ['-date_created'],
    }, 'posts')
  }, {
    server: false,
    default: () => [],
  })

  const { data: circles, refresh: refreshCircles } = useAsyncData('circles', async () => {
    if (!currentUserId.value) return []
    return await safeReadItems('circles', {
      fields: ['*', 'posts.posts_id.*', 'products.products_id.*', 'users.*'],
      filter: { creator: { _eq: currentUserId.value } },
      limit: 15,
      sort: ['-date_created'],
    }, 'circles')
  }, {
    server: false,
    default: () => [],
  })

  async function reloadContent() {
    contentStatusMessage.value = ''
    await Promise.allSettled([
      refreshFeedBar(),
      refreshFeedsPage(),
      refreshPosts(),
      refreshCircles(),
    ])
  }

  return {
    feedBar,
    feedsPage,
    posts,
    circles,
    contentStatusMessage,
    reloadContent,
  }
}

export default useConnectFeedsData