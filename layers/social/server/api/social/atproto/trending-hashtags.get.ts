// GET /api/social/atproto/trending-hashtags
//
// atproto's own trending-topics surface (app.bsky.unspecced.getTrendingTopics)
// — the closest atproto equivalent to a site-wide hashtags listing (there's
// no endpoint to list every hashtag in use) — normalized to the same
// {slug, name} shape tag.vue already renders for Directus `tags` rows.
// Public (no requireAuth — hashtags.vue isn't gated behind sign-in either),
// uses the shared service-account client bootstrapped by
// @mframework/adapter-federation's Nuxt module. `{ items: [] }` (never an
// error) if that client isn't configured/reachable.
import { useAtprotoClient } from '@mframework/adapter-federation/clients/atproto'
import { atprotoTopicToTagChip } from '../../../utils/atproto-normalize'

export default defineEventHandler(async () => {
  try {
    const client = useAtprotoClient()
    const { topics, suggested } = await client.getTrendingTopics({ limit: 25 })
    const combined = [...topics, ...suggested]
    // getTrendingTopics can return the same topic in both `topics` and
    // `suggested` — de-duped by topic string before shaping.
    const seen = new Set<string>()
    const deduped = combined.filter((t) => (seen.has(t.topic) ? false : (seen.add(t.topic), true)))
    return { items: deduped.map(atprotoTopicToTagChip) }
  } catch (error) {
    console.error('[atproto] trending-hashtags fetch failed:', error)
    return { items: [] }
  }
})
