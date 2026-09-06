// POST /api/social/atproto/like  { uri: string, cid: string }
//
// Toggles a like on an atproto post on the current user's own PDS repo —
// the atproto match for reactions.vue's emoji-reaction picker (atproto
// has no arbitrary-emoji reaction concept, only a single like; any emoji
// picked on an atproto-sourced post maps to that one like). `uri` is the
// post's at:// URI (post.vue passes its `post.uri` — see
// atproto-normalize.ts's atprotoPostToPostCard); `cid` lets
// AtprotoClient#createPost's resolveStrongRef-style lookups skip an extra
// round trip when the caller already has it, but is optional — omit it
// and the like call resolves it itself.
import { requireAuth } from '#auth/server/utils/sessions'
import { requireAtprotoClientForUser } from '../../../utils/atproto'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const uri = body?.uri as string | undefined
  let cid = body?.cid as string | undefined
  if (!uri) {
    throw createError({ statusCode: 400, statusMessage: 'uri is required' })
  }

  const client = await requireAtprotoClientForUser(user.id)

  try {
    const post = await client.getPost(uri)
    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'atproto post not found' })
    }
    cid ||= post.cid

    if (post.viewer?.likeUri) {
      await client.unlike(post.viewer.likeUri)
      return { liked: false }
    }
    await client.like(uri, cid)
    return { liked: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({
      statusCode: error?.status || 502,
      statusMessage: error?.message || 'Failed to toggle atproto like',
    })
  }
})
