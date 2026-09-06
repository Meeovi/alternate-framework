// layers/social/server/api/social/atproto/post.post.ts
//
// POST /api/social/atproto/post — creates a post on the AT Protocol PDS as
// the signed-in local user, using their own linked atproto identity (see
// server/utils/atproto.ts). This is the per-user counterpart to
// server/api/social/publish.post.ts's Mastodon flow, and to
// app/types/service/socialFederation.ts's createFederatedPost (which posts
// through the shared service-account client instead — fine for read paths,
// not for "post as me").
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { requireAtprotoClientForUser } from '../../../utils/atproto'

const bodySchema = z.object({
  text: z.string().min(1).max(3000),
  replyParentUri: z.string().optional().nullable(),
  quoteUri: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = bodySchema.parse(await readBody(event))

  const client = await requireAtprotoClientForUser(user.id)

  try {
    const post = await client.createPost({
      text: body.text,
      replyParentUri: body.replyParentUri || null,
      quoteUri: body.quoteUri || null,
    })
    return post
  } catch (error: any) {
    throw createError({
      statusCode: error?.status || 502,
      statusMessage: error?.message || 'Failed to create atproto post',
      data: error?.error,
    })
  }
})
