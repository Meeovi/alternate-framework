import { readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { directus, VIDEO_FIELDS, watchLaterLists } from '#social/server/utils/watchLater'

// The signed-in user's watch-later videos, most recently saved first.
// `listId` is their Watch Later list (null until the first save). Save
// with POST /api/social/watch-later, remove with DELETE …/watch-later/:shortId.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const lists = await watchLaterLists(user.id)
  if (!lists.length) return { listId: null, videos: [] }

  const saved = await directus.request(readItems('lists_shorts' as any, {
    fields: ['id', 'lists_id', ...VIDEO_FIELDS.map((field) => `shorts_id.${field}`)],
    filter: { lists_id: { _in: lists.map((list) => list.id) } },
    sort: ['-id'],
    limit: -1,
  })) as Array<{ lists_id: number, shorts_id: Record<string, any> | null }>

  const seen = new Set<number>()
  const videos = saved
    .map((row) => row.shorts_id)
    // A deleted vibe leaves its junction row with shorts_id null.
    .filter((video): video is Record<string, any> => !!video?.id && !seen.has(video.id) && !!seen.add(video.id))
  return { listId: lists[0]!.id, videos }
})
