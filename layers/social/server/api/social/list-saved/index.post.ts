import { createDirectus, rest, staticToken, readItems, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { resolveListItemKind, normalizeId } from '#social/server/utils/listItemKinds'

// Saves an item (a product, space, or vibe — see listItemKinds.ts) to one
// of the current user's lists via the real per-kind junction table.
// `list_items` (a separate collection for todo-style entries: title,
// status, dueDate, etc.) has no columns for any of these — the older
// addtolist.vue/createListBtn.vue components wrote product fields onto it,
// which never matched the live schema.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { junctionCollection, itemIdColumn } = resolveListItemKind(body?.kind)

  if (!body?.listId || !body?.itemId) {
    throw createError({ statusCode: 400, statusMessage: 'listId and itemId are required' })
  }
  const listId = normalizeId(body.listId)
  const itemId = normalizeId(body.itemId)

  const owned = await directus.request(
    readItems('lists' as any, {
      fields: ['id'],
      filter: { id: { _eq: listId }, user: { user_id: { _eq: user.id } } },
      limit: 1,
    }),
  )
  if (!(owned as any[]).length) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  const existing = await directus.request(
    readItems(junctionCollection as any, {
      fields: ['id'],
      filter: { lists_id: { _eq: listId }, [itemIdColumn]: { _eq: itemId } },
      limit: 1,
    }),
  )
  if ((existing as any[]).length) {
    // Already saved to this list — treat as a success, not a conflict.
    return (existing as any[])[0]
  }

  return directus.request(
    createItem(junctionCollection as any, { lists_id: listId, [itemIdColumn]: itemId }),
  )
})
