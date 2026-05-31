import type { ComputedRef, Ref } from 'vue'
import useContent from '#shared/app/composables/content/useContent'
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

export default async function useConnectFeedsData(currentUserId: ComputedRef<string | null>): Promise<UseConnectFeedsDataResult> {
  const { readItems } = useContent()

  const contentStatusMessage = ref('')

  const { data: feedBar, refresh: refreshFeedBar } = await useAsyncData<FeedBar | null>('feeds:bar', async () => {
    try {
      const resp = await readItems('navigation', {
        filter: { slug: { _eq: 'feed-bar' } },
        fields: ['*', { menus: ['*'] }],
        limit: 1,
      })
      const rows = resp?.data || resp || []
      return rows?.[0] || defaultFeedBar
    } catch {
      return defaultFeedBar
    }
  })

  const { data: feedsPage, refresh: refreshPage } = await useAsyncData<any>('feeds:page', async () => {
    try {
      const resp = await readItems('pages', {
        filter: { slug: { _eq: 'feeds' } },
        fields: ['*'],
        limit: 1,
      })
      const rows = resp?.data || resp || []
      return rows?.[0] || null
    } catch {
      return null
    }
  })

  const { data: posts, refresh: refreshPosts } = await useAsyncData<any[]>('feeds:posts', async () => {
    try {
      const resp = await readItems('posts', {
        fields: ['*', { owner: ['*'], media: ['*'] }],
        sort: ['-date_created'],
        limit: 30,
      })
      const rows = resp?.data || resp || []
      if (!Array.isArray(rows)) return []
      return rows
    } catch {
      return []
    }
  })

  const { data: circles, refresh: refreshCircles } = await useAsyncData<any[]>('feeds:circles', async () => {
    try {
      const uid = currentUserId.value
      const resp = await readItems('circle_posts', {
        fields: ['*', { posts_id: ['*', { owner: ['*'] }] }],
        sort: ['-date_created'],
        filter: uid ? { owner: { _eq: uid } } : undefined,
        limit: 30,
      })
      const rows = resp?.data || resp || []
      return Array.isArray(rows) ? rows : []
    } catch {
      return []
    }
  })

  const reloadContent = async () => {
    contentStatusMessage.value = ''
    await Promise.all([refreshFeedBar(), refreshPage(), refreshPosts(), refreshCircles()])

    if (!feedBar.value || !posts.value) {
      contentStatusMessage.value = 'Some feed content is temporarily unavailable.'
    }
  }

  await reloadContent()

  return {
    feedBar,
    feedsPage,
    posts,
    circles,
    contentStatusMessage,
    reloadContent,
  }
}
