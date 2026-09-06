// GET /api/social/atproto/suggested-members
//
// atproto "accounts you might like" (app.bsky.actor.getSuggestions) — the
// atproto match for members.vue's site-wide members listing — normalized
// to the same SocialProfile shape MemberCard.vue already renders for
// Directus `users` rows. Public (members.vue isn't gated behind sign-in),
// uses the shared service-account client. `{ items: [] }` (never an
// error) if that client isn't configured/reachable.
import { useAtprotoClient } from '@mframework/adapter-federation/clients/atproto'
import { atprotoActorToSocialProfile } from '../../../utils/atproto-normalize'

export default defineEventHandler(async () => {
  try {
    const client = useAtprotoClient()
    const { actors } = await client.getSuggestedActors({ limit: 25 })
    return { items: actors.map(atprotoActorToSocialProfile) }
  } catch (error) {
    console.error('[atproto] suggested-members fetch failed:', error)
    return { items: [] }
  }
})
