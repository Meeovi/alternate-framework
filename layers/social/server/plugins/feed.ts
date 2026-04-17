type NitroCtx = {
  feed: Feed
  options: { path?: string }
}

type Feed = {
  options: Record<string, any>
  addItem: (item: {
    title?: string
    id?: string
    link?: string
    description?: string
    content?: string
    date?: Date
    image?: string
  }) => void
  addCategory: (category: string) => void
  addContributor: (contributor: { name?: string; email?: string; link?: string }) => void
}

type AdapterFeedPost = {
  id?: string | number
  url?: string
  link?: string
  slug?: string
  title?: string
  name?: string
  description?: string
  summary?: string
  content?: string
  body?: string
  createdAt?: string | Date
  date_created?: string | Date
  published_at?: string | Date
  image?: string
}

type FeedItem = {
  id: string
  link: string
  title: string
  description: string
  content: string
  date: Date
  image?: string
}

type AdapterLike = {
  getUnifiedFeed?: (identity: string, limit?: number) => Promise<unknown[]>
  listPosts?: (identity: string, opts?: Record<string, any>) => Promise<unknown[]>
  readItems?: (collection: string, opts?: Record<string, any>) => Promise<unknown[]>
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: NitroCtx) => {
    switch(options.path) {
      case '/feed.xml': {
        await createDynamicFeed(feed)
        break
      }
      case '/feed2.xml': {
        await createDynamicFeed(feed)
        break
      }
    }
  })

  async function createDynamicFeed(feed: Feed) {
    const runtimeConfig = useRuntimeConfig()
    const publicConfig = runtimeConfig.public || {}
    const siteUrl = String(publicConfig.siteUrl || publicConfig.appUrl || 'https://example.com').replace(/\/$/, '')
    const siteName = String(publicConfig.siteName || 'Social Feed')
    const feedPath = String(publicConfig.feedPath || '/feed.xml')
    const feedLink = `${siteUrl}${feedPath.startsWith('/') ? feedPath : `/${feedPath}`}`
    const feedDescription = String(publicConfig.feedDescription || `${siteName} updates`)

    feed.options = {
      id: siteUrl,
      title: siteName,
      link: feedLink,
      description: feedDescription,
      copyright: `${new Date().getFullYear()} ${siteName}`,
    }

    const posts = await loadFeedItems({
      siteUrl,
      identity: String(publicConfig.feedIdentity || process.env.FEED_IDENTITY || ''),
      collection: String(publicConfig.feedCollection || process.env.FEED_COLLECTION || 'posts'),
      limit: Number(publicConfig.feedLimit || process.env.FEED_LIMIT || 20),
    })

    posts.forEach((post) => {
      feed.addItem({
        title: post.title,
        id: post.id,
        link: post.link,
        description: post.description,
        content: post.content,
        date: post.date,
        image: post.image,
      })
    })

    feed.addCategory('Social')

    feed.addContributor({
      name: String(publicConfig.feedContributorName || 'Alternate Framework'),
      email: String(publicConfig.feedContributorEmail || ''),
      link: siteUrl,
    })
  }

  async function loadFeedItems(input: {
    siteUrl: string
    identity: string
    collection: string
    limit: number
  }): Promise<FeedItem[]> {
    const adapter = ((globalThis as any).__adapterServer || (globalThis as any).__adapter || null) as AdapterLike | null
    if (!adapter) return []

    let raw: unknown[] = []

    // 1) Federation/social adapter style
    if (typeof adapter.getUnifiedFeed === 'function' && input.identity) {
      raw = await adapter.getUnifiedFeed(input.identity, input.limit)
    }

    // 2) Simple social adapter style
    if (!raw.length && typeof adapter.listPosts === 'function' && input.identity) {
      raw = await adapter.listPosts(input.identity, { limit: input.limit })
    }

    // 3) Content adapter style (Directus-like)
    if (!raw.length && typeof adapter.readItems === 'function') {
      raw = await adapter.readItems(input.collection, {
        limit: input.limit,
        sort: ['-date_created', '-createdAt', '-published_at'],
        filter: { status: { _in: ['published', 'active', 'live'] } },
      })
    }

    return (Array.isArray(raw) ? raw : [])
      .map((entry, index) => normalizeFeedItem(entry as AdapterFeedPost, index, input.siteUrl))
      .filter((item): item is FeedItem => Boolean(item))
  }

  function normalizeFeedItem(post: AdapterFeedPost, index: number, siteUrl: string): FeedItem | null {
    const title = String(post.title || post.name || `Post ${index + 1}`).trim()
    const content = String(post.content || post.body || post.summary || post.description || '').trim()
    const description = String(post.description || post.summary || content.slice(0, 220)).trim()

    const slugPart = post.slug ? `/${String(post.slug).replace(/^\//, '')}` : ''
    const href = String(post.url || post.link || `${siteUrl}${slugPart}` || siteUrl).trim()
    if (!href) return null

    const rawDate = post.createdAt || post.published_at || post.date_created || new Date()
    const date = rawDate instanceof Date ? rawDate : new Date(rawDate)

    return {
      id: String(post.id || href),
      link: href,
      title,
      description,
      content,
      date: Number.isNaN(date.getTime()) ? new Date() : date,
      image: post.image,
    }
  }
})