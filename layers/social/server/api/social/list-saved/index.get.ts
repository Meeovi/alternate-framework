import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { resolveListItemKind, normalizeId } from '#social/server/utils/listItemKinds'

// Membership check: "which of this user's lists already contain item X of
// kind Y (product/space/vibe)". Scoped in a single query via the `lists`
// relational alias for that kind (the same alias already used to *read*
// saved items elsewhere, see app/pages/lists/list/[...slug].vue) filtered
// by both `user` and the nested item id — Directus resolves that against
// the real junction table, so there's no separate ownership lookup needed.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const { listsAliasField, itemIdColumn } = resolveListItemKind(query.kind)

  if (!query.itemId) {
    throw createError({ statusCode: 400, statusMessage: 'itemId is required' })
  }
  const itemId = normalizeId(query.itemId)

  // `lists.user` is an M2M alias (-> lists_directus_users, columns
  // list_id/user_id), not a plain scalar field — a bare `_eq` 500s
  // ("Invalid numeric value"). Filter through the junction's own field.
  const result = await directus.request(
    readItems('lists' as any, {
      fields: ['id'],
      filter: {
        user: { user_id: { _eq: user.id } },
        [listsAliasField]: { [itemIdColumn]: { _eq: itemId } },
      },
    }),
  )

  return (result as any[]).map((row) => row.id)
})
