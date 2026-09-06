// GET /api/social/atproto/followers
//
// The current user's atproto followers, normalized to the same
// SocialProfile shape layers/social/app/composables/contacts/
// useFriendsPageData.ts already returns for Directus-backed followers —
// merged into that same array client-side, Directus untouched. Returns
// `{ items: [] }` (never an error) whenever the user isn't signed in or
// hasn't linked an atproto account — the Directus-driven "Followers" tab
// keeps working exactly as before either way.
import { getAuthSession } from '#auth/server/utils/sessions'
import { getAtprotoClientForUser } from '../../../utils/atproto'
import { atprotoActorToSocialProfile } from '../../../utils/atproto-normalize'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.user?.id) return { items: [] }

  const client = await getAtprotoClientForUser(session.user.id)
  if (!client || !client.did) return { items: [] }

  try {
    const { actors } = await client.getFollowers(client.did, { limit: 50 })
    return { items: actors.map(atprotoActorToSocialProfile) }
  } catch (error) {
    console.error('[atproto] followers fetch failed:', error)
    return { items: [] }
  }
})
