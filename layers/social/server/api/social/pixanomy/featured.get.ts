import { readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import {
  pixanomyDirectus,
  tallyMediaReactions,
  featuredScore,
  FEATURED_LIKE_WEIGHT,
  FEATURED_VIEW_WEIGHT,
  PIXANOMY_MEDIA_FIELDS,
} from '../../../utils/pixanomy'

// GET /api/social/pixanomy/featured?limit=12
//
// The current user's most popular digital content, across *all*
// categories, ranked by likes + views:
//
//   score = likeCount * FEATURED_LIKE_WEIGHT + views * FEATURED_VIEW_WEIGHT
//
// Ranking is done in-process: pull the user's media (capped at
// WORKING_SET), fold in the like counts from content_reactions with one
// query, score, sort, slice. Items with a zero score are dropped so the
// section shows genuinely-popular content rather than "the newest 12".

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 60

// Upper bound on how many of the user's media rows we rank in one request.
// A single person's uploaded library is very unlikely to exceed this; if
// it does, the least-recently-created rows past the cap are ignored, which
// is an acceptable imprecision for a "featured" strip.
const WORKING_SET = 500

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const limitRaw = Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitRaw) ? DEFAULT_LIMIT : limitRaw))

  const media = await pixanomyDirectus.request(
    readItems('media' as any, {
      filter: { user: { _eq: user.id } },
      sort: ['-date_created'],
      limit: WORKING_SET,
      fields: [...PIXANOMY_MEDIA_FIELDS],
    }),
  )

  const list = Array.isArray(media) ? media : []

  const reactions = await tallyMediaReactions(
    list.map((m: any) => m.id),
    user.id,
  )

  const ranked = list
    .map((m: any) => {
      const r = reactions.get(String(m.id))
      const likeCount = r?.likeCount ?? 0
      const views = Number(m.views ?? 0)
      return {
        ...m,
        views,
        likeCount,
        liked: r?.liked ?? false,
        score: featuredScore(likeCount, views),
      }
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || String(b.date_created ?? '').localeCompare(String(a.date_created ?? '')))
    .slice(0, limit)

  return {
    items: ranked,
    limit,
    weights: { like: FEATURED_LIKE_WEIGHT, view: FEATURED_VIEW_WEIGHT },
  }
})
