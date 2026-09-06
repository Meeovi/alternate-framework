// GET /api/social/atproto/own-posts
//
// The current user's own past atproto posts (app.bsky.feed.getAuthorFeed
// on themselves) — the atproto match for memories.vue's "previous posts"
// (historyPosts), normalized to the same post.vue-compatible shape.
// `{ items: [] }` (never an error) when signed out or not atproto-linked.
import { getAuthSession } from '#auth/server/utils/sessions'
import { getAtprotoClientForUser } from '../../../utils/atproto'
import { atprotoPostToPostCard } from '../../../utils/atproto-normalize'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.user?.id) return { items: [] }

  const client = await getAtprotoClientForUser(session.user.id)
  if (!client || !client.handle) return { items: [] }

  try {
    const { posts } = await client.getAuthorFeed({ handle: client.handle, limit: 30 })
    return { items: posts.map(atprotoPostToPostCard) }
  } catch (error) {
    console.error('[atproto] own-posts fetch failed:', error)
    return { items: [] }
  }
})
