// GET /api/social/atproto/timeline
//
// The current user's atproto following-feed ("activity"), normalized to
// the same shape post.vue already renders for Directus `posts` rows —
// merged into feeds.vue's `posts` array. `{ items: [] }` (never an error)
// when signed out or not atproto-linked.
import { getAuthSession } from '#auth/server/utils/sessions'
import { getAtprotoClientForUser } from '../../../utils/atproto'
import { atprotoPostToPostCard } from '../../../utils/atproto-normalize'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.user?.id) return { items: [] }

  const client = await getAtprotoClientForUser(session.user.id)
  if (!client) return { items: [] }

  const query = getQuery(event)
  const limit = Math.min(Math.max(1, Number(query.limit) || 20), 50)

  try {
    const { posts } = await client.getTimeline({ limit })
    return { items: posts.map(atprotoPostToPostCard) }
  } catch (error) {
    console.error('[atproto] timeline fetch failed:', error)
    return { items: [] }
  }
})
