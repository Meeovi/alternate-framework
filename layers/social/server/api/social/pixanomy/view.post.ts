import { readItem, updateItem } from '@directus/sdk'
import { getAuthSession } from '#auth/server/utils/sessions'
import { pixanomyDirectus } from '../../../utils/pixanomy'

// POST /api/social/pixanomy/view   body: { id: string | number }
//
// Bumps `media.views` by one. Simple read-then-write increment — not
// atomic, exactly like view-video.post.ts (`shorts.views`); a lost
// increment under concurrent views is acceptable imprecision for a view
// counter.
//
// Public on purpose (a media item may be viewed outside the owner's
// Pixanomy dashboard). The one thing it does check: the owner's own views
// don't count, so the `featured` ranking reflects *other people's*
// engagement rather than the owner reloading their own page. View
// tracking is a non-critical side effect — it never throws on a missing
// row, it just reports `counted: false`.

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body?.id

  if (id === undefined || id === null || id === '') {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const media = await pixanomyDirectus
    .request(readItem('media' as any, id, { fields: ['id', 'user', 'views'] }))
    .catch(() => null)

  if (!media) {
    return { counted: false }
  }

  const session = await getAuthSession(event).catch(() => null)
  const viewerId = session?.user?.id

  if (viewerId && String((media as any).user) === String(viewerId)) {
    return { counted: false, views: Number((media as any).views ?? 0) }
  }

  const next = Number((media as any).views ?? 0) + 1
  await pixanomyDirectus.request(updateItem('media' as any, id, { views: next }))

  return { counted: true, views: next }
})
