import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { MAX_TAGS, listVibeProducts, readShort, resolveTags, setVibeProducts } from '../../../../utils/vibeProducts'

/**
 * PUT /api/social/vibez/:id/products — the vibe's creator (or an admin) sets
 * the products tagged on it, replacing the old list.
 * Body: { tags: [{ product: <Directus id | 'magento:<sku>'>, start?, end? }] }
 * (seconds; with a start the product card pops up over the player then).
 */
const Body = z.object({
  tags: z.array(z.object({
    product: z.union([z.string().max(80), z.number().int().nonnegative()]),
    start: z.number().nullable().optional(),
    end: z.number().nullable().optional(),
  })).max(MAX_TAGS),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, role?: string | null }
  const short = await readShort(String(getRouterParam(event, 'id') ?? ''))
  const isAdmin = (user.role || '').split(',').map((r) => r.trim()).includes('admin')
  if (!isAdmin && (!short.creator_id || short.creator_id !== user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Only the vibe\'s creator can tag products on it' })
  }
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid products' })
  const tags = await resolveTags(parsed.data.tags)
  await setVibeProducts(short.id, user.id, tags)
  return { canEdit: true, items: await listVibeProducts(short.id) }
})
