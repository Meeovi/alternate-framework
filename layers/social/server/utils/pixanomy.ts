import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'

// Shared plumbing for the Pixanomy content sections
// (layers/social/app/components/features/pixSections/*). Every section
// renders the *current user's* own digital content, which all lives in the
// one `media` collection (the same collection the Media Center writes to),
// split by a `category` string field. See usePixanomyContent.ts on the
// client for the matching category slugs.
//
// Directus is reached with the server-only static token here — the same
// pattern as reactions.*.ts and social/lists/*. These endpoints do their
// own per-user scoping (`media.user _eq session.user.id`); never expose
// this client or token to the browser.
export const pixanomyDirectus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

// component file  ->  media.category value
//   3d.vue            '3d'
//   design.vue        'design'
//   document.vue      'document'
//   generative-ai.vue 'generative_ai'
//   imaging.vue       'imaging'
//   video.vue         'video'
// `featured` is not a category — it's a cross-category ranking (see
// featured.get.ts).
export const PIXANOMY_CATEGORIES = [
  'imaging',
  'video',
  '3d',
  'design',
  'generative_ai',
  'document',
] as const

export type PixanomyCategory = (typeof PIXANOMY_CATEGORIES)[number]

export function isPixanomyCategory(value: unknown): value is PixanomyCategory {
  return typeof value === 'string' && (PIXANOMY_CATEGORIES as readonly string[]).includes(value)
}

// content_reactions.target_type used for likes on a `media` row. Keep in
// sync with the <LikeButton target-type="media" …> the pixSections
// components render. See MEMORY: content-reactions-likes.
export const MEDIA_REACTION_TARGET_TYPE = 'media'

// LikeButton (and /api/social/reactions) count only the heart emoji, so
// match that here — otherwise the number folded into each item would drift
// from what the button shows once it does its own status fetch.
export const MEDIA_REACTION_EMOJI = '❤️'

// "most popular by likes and visits" — a like is worth more than a passive
// view, so it's weighted heavier. Tunable; keep both non-zero so each
// signal still moves the ranking.
export const FEATURED_LIKE_WEIGHT = 3
export const FEATURED_VIEW_WEIGHT = 1

export function featuredScore(likes: number, views: number): number {
  return likes * FEATURED_LIKE_WEIGHT + views * FEATURED_VIEW_WEIGHT
}

// One query, tallied in JS: for a set of media ids, how many likes each has
// and whether `userId` is among the reactors. Returns a Map keyed by the
// media id as a string.
export async function tallyMediaReactions(
  mediaIds: Array<string | number>,
  userId?: string,
): Promise<Map<string, { likeCount: number; liked: boolean }>> {
  const result = new Map<string, { likeCount: number; liked: boolean }>()
  const ids = [...new Set(mediaIds.map((id) => String(id)))]
  if (!ids.length) return result

  for (const id of ids) result.set(id, { likeCount: 0, liked: false })

  const rows = await pixanomyDirectus.request(
    readItems('content_reactions', {
      filter: {
        target_type: { _eq: MEDIA_REACTION_TARGET_TYPE },
        target_id: { _in: ids },
        emoji: { _eq: MEDIA_REACTION_EMOJI },
      },
      fields: ['target_id', 'user_id'],
      limit: -1,
    }),
  )

  for (const row of Array.isArray(rows) ? rows : []) {
    const key = String((row as any).target_id)
    const entry = result.get(key)
    if (!entry) continue
    entry.likeCount += 1
    if (userId && (row as any).user_id === userId) entry.liked = true
  }

  return result
}

// Fields returned for a media row across the Pixanomy endpoints. `*`
// (scalars only, no relations) keeps this resilient to the exact `media`
// schema while still giving the client everything it needs to render a
// card (`category` and `views` are the two fields Pixanomy adds on top of
// what the Media Center already uses).
export const PIXANOMY_MEDIA_FIELDS = ['*'] as const
