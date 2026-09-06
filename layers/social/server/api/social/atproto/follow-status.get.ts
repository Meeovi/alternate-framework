// GET /api/social/atproto/follow-status?targetDid=did:plc:...
//
// Atproto counterpart to server/api/social/follow-status.get.ts, called by
// FollowButton.vue when its `id` prop is an atproto-sourced member
// (`atproto:{did}` — see atproto-normalize.ts). AppBskyActorDefs' own
// `viewer.following` is the follow record's own at:// URI when the
// current user follows this actor, absent otherwise — the same signal
// FollowButton needs, with no separate "is following" query required.
import { getAuthSession } from '#auth/server/utils/sessions'
import { getAtprotoClientForUser } from '../../../utils/atproto'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetDid = query.targetDid as string | undefined
  if (!targetDid) {
    throw createError({ statusCode: 400, statusMessage: 'targetDid is required' })
  }

  // Public read, same as the Directus follow-status route — a signed-out
  // or non-atproto-linked viewer just gets `following: false`.
  const session = await getAuthSession(event).catch(() => null)
  if (!session?.user?.id) return { following: false }

  const client = await getAtprotoClientForUser(session.user.id)
  if (!client) return { following: false }

  try {
    const profile = await client.getProfile(targetDid)
    return { following: Boolean(profile.viewer?.following) }
  } catch (error) {
    console.error('[atproto] follow-status fetch failed:', error)
    return { following: false }
  }
})
