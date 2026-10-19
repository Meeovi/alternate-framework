// GET /api/social/atproto/explore-posts?limit=
//
// Public feed of atproto notes ("posts") for the explore page. Reads the
// network's public feed generator through the service-account client that
// @mframework/meeovi-atproto's Nuxt module bootstraps (this PDS rejects
// anonymous reads, so an unauthenticated read fails), and normalizes every
// post into the exact shape post.vue already renders for Directus `posts`
// rows — so one card component serves both sources.
//
// Never errors: `{ items: [] }` when the service account isn't configured,
// the PDS is unreachable, or the feed generator isn't available on it.
import { useAtprotoClient } from '@mframework/meeovi-atproto/client'
import { atprotoPostToPostCard } from '../../../utils/atproto-normalize'

/** The AppView's public "what's hot" feed generator — the network's own
 *  trending posts, i.e. atproto's closest thing to a public explore feed.
 *  Point a deployment at its own feed with
 *  `runtimeConfig.public.atproto.exploreFeed` (or ATPROTO_EXPLORE_FEED). */
const DEFAULT_EXPLORE_FEED = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(1, Number(query.limit) || 12), 50)

  const config = useRuntimeConfig() as any
  const feedUri = config?.public?.atproto?.exploreFeed
    || process.env.ATPROTO_EXPLORE_FEED
    || DEFAULT_EXPLORE_FEED

  try {
    const client = useAtprotoClient()
    const { posts } = await client.getFeed(feedUri, { limit })
    return { items: posts.map(atprotoPostToPostCard) }
  } catch (error) {
    console.error('[atproto] explore-posts feed fetch failed:', error)
    return { items: [] }
  }
})
