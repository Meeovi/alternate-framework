// POST /api/social/atproto/follow  { targetDid: string }
//
// Atproto counterpart to server/api/social/follow.post.ts — toggles a
// follow record on the current user's own PDS repo. Called by
// FollowButton.vue when its `id` prop is an atproto-sourced member
// (`atproto:{did}`). Requires a linked atproto account (unlike the
// read-only follow-status route, there's no sensible no-op here — the
// button already only renders for a signed-in user, and toggling a follow
// with no atproto session to act through is a real error to surface).
import { requireAuth } from '#auth/server/utils/sessions'
import { requireAtprotoClientForUser } from '../../../utils/atproto'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const targetDid = body?.targetDid as string | undefined
  if (!targetDid) {
    throw createError({ statusCode: 400, statusMessage: 'targetDid is required' })
  }

  const client = await requireAtprotoClientForUser(user.id)

  try {
    const profile = await client.getProfile(targetDid)
    if (profile.viewer?.following) {
      await client.unfollow(profile.viewer.following)
      return { following: false }
    }
    await client.follow(targetDid)
    return { following: true }
  } catch (error: any) {
    throw createError({
      statusCode: error?.status || 502,
      statusMessage: error?.message || 'Failed to toggle atproto follow',
    })
  }
})
