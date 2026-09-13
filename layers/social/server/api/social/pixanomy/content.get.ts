import { readItems, aggregate } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import {
  pixanomyDirectus,
  isPixanomyCategory,
  tallyMediaReactions,
  PIXANOMY_CATEGORIES,
  PIXANOMY_MEDIA_FIELDS,
} from '../../../utils/pixanomy'

// GET /api/social/pixanomy/content?category=imaging&page=1&limit=24&sort=-date_created
//
// One page of the current user's `media` rows in a single category, newest
// first by default. Each item is returned with `likeCount` / `liked`
// folded in (one extra query for the whole page) so a pixSection component
// can render a like button without an N+1.
//
// Auth-gated and user-scoped: `media.user _eq session.user.id`. The
// pixanomy/index.vue page carries `middleware: 'auth'` too, but that only
// guards the page — this endpoint enforces it independently.

const SORT_WHITELIST = new Set([
  'date_created',
  '-date_created',
  'name',
  '-name',
  'views',
  '-views',
])

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 100

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const category = String(query.category ?? '')
  if (!isPixanomyCategory(category)) {
    throw createError({
      statusCode: 400,
      statusMessage: `category must be one of: ${PIXANOMY_CATEGORIES.join(', ')}`,
    })
  }

  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1)
  const limitRaw = Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitRaw) ? DEFAULT_LIMIT : limitRaw))
  const offset = (page - 1) * limit

  const sortParam = String(query.sort ?? '-date_created')
  const sort = SORT_WHITELIST.has(sortParam) ? sortParam : '-date_created'

  const filter = {
    user: { _eq: user.id },
    category: { _eq: category },
  }

  const [items, countRows] = await Promise.all([
    pixanomyDirectus.request(
      readItems('media' as any, {
        filter,
        sort: [sort],
        limit,
        offset,
        fields: [...PIXANOMY_MEDIA_FIELDS],
      }),
    ),
    pixanomyDirectus.request(
      aggregate('media' as any, {
        aggregate: { count: '*' },
        query: { filter },
      }),
    ),
  ])

  const list = Array.isArray(items) ? items : []
  const total = Number((Array.isArray(countRows) ? countRows[0]?.count : 0) ?? 0)

  const reactions = await tallyMediaReactions(
    list.map((m: any) => m.id),
    user.id,
  )

  const withReactions = list.map((m: any) => {
    const r = reactions.get(String(m.id))
    return {
      ...m,
      views: Number(m.views ?? 0),
      likeCount: r?.likeCount ?? 0,
      liked: r?.liked ?? false,
    }
  })

  return {
    category,
    items: withReactions,
    page,
    limit,
    total,
    hasMore: offset + list.length < total,
  }
})
