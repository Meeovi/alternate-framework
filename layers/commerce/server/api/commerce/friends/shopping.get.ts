import { defineEventHandler, createError } from 'h3'
import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
import { and, eq, inArray } from 'drizzle-orm'
import { requireAuth } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { cart, cartItems, users } from '#auth/server/database/migrations/schema'
import { getDirectusFacade } from '../../../utils/directusClient'

// "Your friends" = the users the signed-in viewer follows. "What they're
// shopping for" = the line items in each of those users' currently *active*
// cart — deliberately not orders/purchases, which live in a different
// collection and a different page (orders.vue). The wishlist store is
// localStorage-only (see stores/wishlist/useWishlistStore.ts) so it can't
// be read for another user; the cart is the only server-persisted signal
// of shopping intent.
//
// `follows` is read through Directus (follower_id + target_id/target_type,
// matching follow.post.ts) — the same flat cross-system reference the
// social layer uses. Carts are read straight through drizzle at the same
// Postgres database, matching server/utils/cart.ts, since Directus's own
// API rejects reads/writes that touch the broken cart_items.cart relation.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

interface FriendShoppingItem {
  key: string
  productId: string
  quantity: number
  product: Record<string, any>
}

interface FriendShopping {
  id: string
  name: string
  username: string | null
  items: FriendShoppingItem[]
}

export default defineEventHandler(async (event): Promise<{ friends: FriendShopping[] }> => {
  const me = await requireAuth(event)

  // 1. Who does the viewer follow? (people only — target_type 'space' is
  //    a followed Space, not a person)
  const followRows = (await directus
    .request(
      readItems('follows', {
        filter: {
          follower_id: { _eq: me.id },
          target_type: { _eq: 'user' },
        },
        fields: ['target_id'],
        limit: -1,
      }),
    )
    .catch((error) => {
      console.error('[commerce:friends/shopping] failed to read follows', error)
      throw createError({ statusCode: 502, statusMessage: 'Could not load your following list' })
    })) as Array<{ target_id: string }>

  const followedIds = [...new Set(followRows.map((r) => r.target_id).filter(Boolean))]
  if (followedIds.length === 0) {
    return { friends: [] }
  }

  // 2. Their active carts, and 3. the items in them — two narrow queries
  //    rather than a join so the drizzle schema stays the only contract.
  const cartRows = await db
    .select({ id: cart.id, user: cart.user })
    .from(cart)
    .where(and(inArray(cart.user, followedIds), eq(cart.status, 'active')))

  if (cartRows.length === 0) {
    return { friends: [] }
  }

  const cartUserMap = new Map(cartRows.map((c) => [c.id, c.user as string]))

  const itemRows = await db
    .select()
    .from(cartItems)
    .where(inArray(cartItems.cart, cartRows.map((c) => c.id)))

  if (itemRows.length === 0) {
    return { friends: [] }
  }

  const lineProductId = (item: (typeof itemRows)[number]) =>
    item.productId ?? (item.products != null ? String(item.products) : '')

  // 4. Resolve full product records from Directus so productCard.vue can
  //    render ratings / shop / pricing, not just a name. Falls back to the
  //    name/image/price snapshot stored on the cart line if a product has
  //    since been unpublished or deleted.
  const productIds = [...new Set(itemRows.map(lineProductId).filter(Boolean))]
  const productMap = new Map<string, Record<string, any>>()
  if (productIds.length > 0) {
    const products = (await getDirectusFacade()
      .request(
        readItems('products', {
          filter: { id: { _in: productIds } },
          fields: ['*', { '*': ['*'] }],
          limit: -1,
        }),
      )
      .catch((error) => {
        console.error('[commerce:friends/shopping] failed to read products', error)
        return [] as Array<Record<string, any>>
      })) as Array<Record<string, any>>
    for (const product of products) {
      productMap.set(String(product.id), product)
    }
  }

  // 5. Friend display names
  const profileRows = await db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(inArray(users.id, followedIds))
  const profileMap = new Map(profileRows.map((u) => [u.id, u]))

  // 6. Group line items under the friend whose cart they belong to
  const itemsByFriend = new Map<string, FriendShoppingItem[]>()
  for (const item of itemRows) {
    const userId = cartUserMap.get(item.cart as number)
    if (!userId) continue

    const productId = lineProductId(item)
    const metadata = (item.metadata ?? {}) as Record<string, any>
    const product = productMap.get(productId) ?? {
      id: productId,
      name: metadata.name ?? 'Product',
      price: (item.price ?? 0) / 100,
      image: metadata.image ?? null,
    }

    if (!itemsByFriend.has(userId)) itemsByFriend.set(userId, [])
    itemsByFriend.get(userId)!.push({
      key: String(item.id),
      productId,
      quantity: item.quantity ?? 1,
      product,
    })
  }

  const friends: FriendShopping[] = followedIds
    .filter((id) => itemsByFriend.has(id))
    .map((id) => {
      const profile = profileMap.get(id)
      return {
        id,
        name: profile?.name || profile?.username || 'Someone',
        username: profile?.username ?? null,
        items: itemsByFriend.get(id)!,
      }
    })

  return { friends }
})
