import { randomBytes } from 'node:crypto'
import { createDirectus, rest, staticToken, readItems, createItem, deleteItems } from '@directus/sdk'
import { createError } from 'h3'
import { savedItemTarget } from './listItemKinds'
import { backendProductSnapshot } from './backendProducts'

/**
 * The wishlist is a list of type "Wishlist" (Directus `lists_type`), not a
 * separate store: the product card's heart saves into the user's oldest
 * Wishlist list, created on first use. Products are saved like "Add to
 * List" saves them (lists_products for the site's catalogue,
 * lists_backend_products for a commerce backend's `<backend>:<key>`).
 */

export const WISHLIST_TYPE = 'Wishlist'

export type Wishlist = { id: number, slug: string, name: string }

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

/** The user's wishlist (their oldest Wishlist-type list), or null. */
export async function findWishlist(userId: string): Promise<Wishlist | null> {
  const rows = await directus().request(readItems('lists' as any, {
    fields: ['id', 'slug', 'name'],
    filter: { _and: [
      { user: { user_id: { _eq: userId } } },
      { lists_type: { lists_type_id: { name: { _eq: WISHLIST_TYPE } } } },
    ] },
    sort: ['id'],
    limit: 1,
  })) as any[]
  return rows?.[0] ?? null
}

// One creation at a time per user, so two quick hearts can't make two wishlists.
const creating = new Map<string, Promise<Wishlist>>()

/** The user's wishlist, created (private, named "Wishlist") when they have none. */
export async function ensureWishlist(userId: string): Promise<Wishlist> {
  const existing = await findWishlist(userId)
  if (existing) return existing
  const pending = creating.get(userId)
  if (pending) return pending
  const create = (async () => {
    const [type] = await directus().request(readItems('lists_type' as any, {
      fields: ['id'], filter: { name: { _eq: WISHLIST_TYPE } }, limit: 1,
    })) as any[]
    if (!type) throw createError({ statusCode: 500, statusMessage: 'The Wishlist list type is missing' })
    return await directus().request(createItem('lists' as any, {
      name: 'Wishlist',
      slug: `wishlist-${randomBytes(4).toString('hex')}`,
      status: 'Private',
      type: 'Product',
      user: { create: [{ user_id: userId }], update: [], delete: [] },
      lists_type: { create: [{ lists_type_id: type.id }], update: [], delete: [] },
    }, { fields: ['id', 'slug', 'name'] })) as Wishlist
  })()
  creating.set(userId, create)
  try {
    return await create
  } finally {
    creating.delete(userId)
  }
}

/** Product keys saved in a list (a Directus product's id, or `<backend>:<key>`). */
export async function wishlistKeys(listId: number): Promise<string[]> {
  const [row] = await directus().request(readItems('lists' as any, {
    fields: ['products.products_id', 'backend_products.product_key'],
    filter: { id: { _eq: listId } },
    limit: 1,
  })) as any[]
  return [
    ...(row?.products ?? []).map((p: any) => p?.products_id).filter((id: unknown) => id != null).map(String),
    ...(row?.backend_products ?? []).map((p: any) => p?.product_key).filter((key: unknown) => typeof key === 'string'),
  ]
}

function productTarget(productKey: unknown) {
  const target = savedItemTarget('product', productKey)
  if (!target) throw createError({ statusCode: 400, statusMessage: 'That product can\'t be saved' })
  return target
}

/** Saves a product to the list (no-op when it's already there). */
export async function addToList(listId: number, productKey: unknown): Promise<void> {
  const target = productTarget(productKey)
  const existing = await directus().request(readItems(target.junctionCollection as any, {
    fields: ['id'],
    filter: { lists_id: { _eq: listId }, [target.itemIdColumn]: { _eq: target.itemId } },
    limit: 1,
  })) as any[]
  if (existing.length) return
  const snapshot = target.backend ? await backendProductSnapshot(target.backend.id, target.backend.key) : {}
  if (!snapshot) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  await directus().request(createItem(target.junctionCollection as any, {
    lists_id: listId, [target.itemIdColumn]: target.itemId, ...snapshot,
  }))
}

/** Removes a product from the list. */
export async function removeFromList(listId: number, productKey: unknown): Promise<void> {
  const target = productTarget(productKey)
  const rows = await directus().request(readItems(target.junctionCollection as any, {
    fields: ['id'],
    filter: { lists_id: { _eq: listId }, [target.itemIdColumn]: { _eq: target.itemId } },
  })) as any[]
  if (rows.length) await directus().request(deleteItems(target.junctionCollection as any, rows.map((r) => r.id)))
}
