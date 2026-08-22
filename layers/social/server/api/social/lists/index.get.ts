import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Previously the client called $directus directly (useLists.ts, a static/
// admin token) with no `user` filter — any authenticated user could list,
// read, edit, or delete any other user's lists. This route enforces
// ownership scoping server-side for the `lists` collection itself (list
// metadata: name/type/color/icon). `list_items` still goes through
// $directus directly — the relation field name for list_items -> lists is
// inconsistent across call sites (`list`/`listId`/`list_id` all appear),
// which needs its own investigation before it can be safely migrated too.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const sort = query.sort ? (Array.isArray(query.sort) ? query.sort : [query.sort]) as string[] : undefined
  const typeFilter = query.type ? String(query.type) : undefined

  const filter: Record<string, any> = { user: { _eq: user.id } }
  if (typeFilter) filter.type = { _eq: typeFilter }

  const result = await directus.request(
    readItems('lists' as any, {
      filter,
      ...(sort ? { sort } : {}),
    }),
  )
  return Array.isArray(result) ? result : []
})
