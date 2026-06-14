import type { ComputedRef, Ref } from 'vue'

type FeedMenu = { name: string; value: string }
type FeedBar = {
  name: string
  color: string
  colortext: string
  menus: FeedMenu[]
}

type UseConnectFeedsDataResult = {
  feedBar: Ref<FeedBar | null | undefined>
  feedsPage: Ref<any>
  posts: Ref<any[] | undefined>
  circles: Ref<any[] | undefined>
  contentStatusMessage: Ref<string>
  reloadContent: () => Promise<void>
  loadMorePosts: () => Promise<void>
  loadMoreCircles: () => Promise<void>
}

const defaultFeedBar: FeedBar = {
  name: 'Activity Feed',
  color: '#2b5db7',
  colortext: '#ffffff',
  menus: [
    { name: 'All', value: 'all' },
    { name: 'Following', value: 'following' },
    { name: 'Circles', value: 'circles' },
    { name: 'For You', value: 'for-you' },
  ],
}

export default function useConnectFeedsData(currentUserId: ComputedRef<string | null>): UseConnectFeedsDataResult {
  const { $readItems } = useNuxtApp()

  const contentStatusMessage = ref('')

  const { data: feedBar, refresh: refreshFeedBar } = useAsyncData<FeedBar | null>('feeds:bar', async () => {
    try {
      const rows = await readItems('navigation', {
        filter: { slug: { _eq: 'feed-bar' } },
        fields: ['*', { menus: ['*'] }],
        limit: 1,
      })
      return Array.isArray(rows) ? rows[0] : defaultFeedBar
    } catch {
      return defaultFeedBar
    }
  })

  const { data: feedsPage, refresh: refreshPage } = useAsyncData<any>('feeds:page', async () => {
    try {
      const rows = await readItems('pages', {
        filter: { slug: { _eq: 'feeds' } },
        fields: ['*'],
        limit: 1,
      })
      return Array.isArray(rows) ? rows[0] : null
    } catch {
      return null
    }
  })

  const { data: posts, refresh: refreshPosts } = useAsyncData<any[]>('feeds:posts', async () => {
    try {
      const rows = await readItems('posts', {
        fields: ['*', { owner: ['*'], media: ['*'] }],
        sort: ['-date_created'],
        limit: 30,
      })
      if (!Array.isArray(rows)) return []
      return rows
    } catch {
      return []
    }
  })

  const postsOffset = ref(0)

  const loadMorePosts = async () => {
    const currentOffset = postsOffset.value
    const rows = await readItems('posts', {
      fields: ['*', { owner: ['*'], media: ['*'] }],
      sort: ['-date_created'],
      limit: 30,
      offset: currentOffset,
    })
    if (Array.isArray(rows) && rows.length) {
      posts.value = [...(posts.value || []), ...rows]
      postsOffset.value += rows.length
    }
  }

  const { data: circles, refresh: refreshCircles } = useAsyncData<any[]>('feeds:circles', async () => {
    try {
      const uid = currentUserId.value
      const rows = await readItems('circle_posts', {
        fields: ['*', { posts_id: ['*', { owner: ['*'] }] }],
        sort: ['-date_created'],
        filter: uid ? { owner: { _eq: uid } } : undefined,
        limit: 30,
      })
      return Array.isArray(rows) ? rows : []
    } catch {
      return []
    }
  })

  const circlesOffset = ref(0)

  const loadMoreCircles = async () => {
    const currentOffset = circlesOffset.value
    const uid = currentUserId.value
    const rows = await readItems('circle_posts', {
      fields: ['*', { posts_id: ['*', { owner: ['*'] }] }],
      sort: ['-date_created'],
      filter: uid ? { owner: { _eq: uid } } : undefined,
      limit: 30,
      offset: currentOffset,
    })
    if (Array.isArray(rows) && rows.length) {
      circles.value = [...(circles.value || []), ...rows]
      circlesOffset.value += rows.length
    }
  }

  const reloadContent = async () => {
    contentStatusMessage.value = ''
    await Promise.all([refreshFeedBar(), refreshPage(), refreshPosts(), refreshCircles()])

    if (!feedBar.value || !posts.value) {
      contentStatusMessage.value = 'Some feed content is temporarily unavailable.'
    }
  }

  return {
    feedBar,
    feedsPage,
    posts,
    circles,
    contentStatusMessage,
    reloadContent,
    loadMorePosts,
    loadMoreCircles,
  }
}
