import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk'
import { randomBytes } from 'node:crypto'

/**
 * Watch Later: a user's list of the Directus `lists_type` "Watch Later",
 * holding vibes (`shorts`) through lists_shorts — the same junction the
 * "Add to List" panel uses (listItemKinds.ts, kind 'vibe'). Made on the
 * user's first save.
 */
export const WATCH_LATER_TYPE = 'Watch Later'

export const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

/** The shorts fields a watch-later card and <MeeoviPlayer> need. */
export const VIDEO_FIELDS = ['id', 'name', 'description', 'type', 'status', 'video', 'video_url', 'thumbnail', 'thumbnail_url', 'date_created']

/** The user's Watch Later lists, oldest first (lists.user is an M2M alias — see lists/index.get.ts). */
export async function watchLaterLists(userId: string): Promise<Array<{ id: number }>> {
  return await directus.request(readItems('lists' as any, {
    fields: ['id'],
    filter: { user: { user_id: { _eq: userId } }, lists_type: { lists_type_id: { name: { _eq: WATCH_LATER_TYPE } } } },
    sort: ['date_created'],
    limit: -1,
  })) as Array<{ id: number }>
}

/** The user's oldest Watch Later list, made if there is none. */
export async function ensureWatchLaterList(userId: string): Promise<number> {
  const [existing] = await watchLaterLists(userId)
  if (existing) return existing.id
  const [type] = await directus.request(readItems('lists_type' as any, {
    fields: ['id'], filter: { name: { _eq: WATCH_LATER_TYPE } }, limit: 1,
  })) as Array<{ id: number }>
  if (!type) throw createError({ statusCode: 503, statusMessage: `The "${WATCH_LATER_TYPE}" list type is missing in Directus` })
  const created = await directus.request(createItem('lists' as any, {
    name: WATCH_LATER_TYPE,
    slug: `watch-later-${randomBytes(3).toString('hex')}`,
    type: 'playlist',
    status: 'Private',
    user: { create: [{ user_id: userId }], update: [], delete: [] },
    lists_type: { create: [{ lists_type_id: type.id }], update: [], delete: [] },
  })) as { id: number }
  return created.id
}
