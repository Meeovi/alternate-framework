import { randomBytes } from 'node:crypto'
import { createDirectus, rest, staticToken, createItem, readItems } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const STATUSES = new Set(['Private', 'Public'])

// Directus only slugifies `name` in its admin UI (the input-slug interface),
// not over the API — a list created here without one links to
// /lists/list/undefined. Suffix so two lists with one name don't collide.
const slugFor = (name: string) =>
  `${name.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 60) || 'list'}-${randomBytes(3).toString('hex')}`

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const { name, type = 'basic', color, icon, description, status, listsType } = (body ?? {}) as {
    name: string
    type?: string
    color?: string
    icon?: string
    description?: string
    status?: string
    listsType?: string
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  // listsType: a Directus `lists_type` by name (e.g. Wishlist), linked
  // through the lists_type_lists junction.
  let listsTypeId: number | undefined
  if (listsType !== undefined) {
    if (typeof listsType !== 'string' || !/^[\w -]{1,40}$/.test(listsType)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid list type' })
    }
    const [row] = await directus.request(readItems('lists_type' as any, {
      fields: ['id'], filter: { name: { _eq: listsType } }, limit: 1,
    })) as any[]
    if (!row) throw createError({ statusCode: 400, statusMessage: 'Unknown list type' })
    listsTypeId = row.id
  }

  // `lists.user` is an M2M alias (-> lists_directus_users, columns
  // list_id/user_id), not a plain scalar field — a bare `user: user.id`
  // silently writes nothing, leaving the list ownerless. Force ownership
  // from the session via the real nested-write shape — never trust a
  // client-supplied user.
  return directus.request(
    createItem('lists' as any, {
      name: name.trim(),
      slug: slugFor(name),
      type,
      color,
      icon,
      ...(typeof description === 'string' ? { description } : {}),
      ...(status && STATUSES.has(status) ? { status } : {}),
      user: { create: [{ user_id: user.id }], update: [], delete: [] },
      ...(listsTypeId !== undefined
        ? { lists_type: { create: [{ lists_type_id: listsTypeId }], update: [], delete: [] } }
        : {}),
    }),
  )
})
