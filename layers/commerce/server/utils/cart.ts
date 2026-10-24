import { and, eq } from 'drizzle-orm'
import { readItem } from '@directus/sdk'
import type { H3Event } from 'h3'
import { createError, getCookie, setCookie } from 'h3'
import { db } from '#auth/server/utils/drizzle'
import { cart, cartItems } from '#auth/server/database/migrations/schema'
import { getAuthSession } from '#auth/server/utils/sessions'
import { getDirectusFacade } from './directusClient'
import type { CommerceBackendAdapter } from 'alternate-sdk'
import { parseProductRef } from './productRef'

// The `cart`/`cart_items` Directus collections exist with a full schema
// (see layers/auth/server/database/migrations/schema.ts) but their
// `cart_items.cart` field carries two conflicting relation definitions in
// Directus itself — a plain m2o AND a same-named reverse alias for an
// unrelated `cart_cart_items` m2m junction — which makes Directus's own
// REST and GraphQL APIs reject any write to that field ("Invalid
// one-to-many update structure"), confirmed live against both. Going
// straight through drizzle at the same Postgres database Directus manages
// sidesteps that broken API-layer relation metadata entirely; the rows
// land in the exact same table Directus reads from, so they still show up
// there. Product lookups still go through Directus (read-only, via
// getDirectusFacade) so pricing stays on the same trusted, server-resolved
// path checkout already uses — never trusting a client-supplied price.

const GUEST_COOKIE_NAME = 'cart_session_id'
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface ResolvedCartContext {
  cartId: number
  userId?: string
}

/**
 * Finds (or creates) the single active cart for the current request — the
 * signed-in user's cart when there's a session, otherwise a guest cart
 * keyed by a random id stored in an httpOnly cookie. A guest cart found
 * this way is claimed (re-parented to the user) the first time its owner
 * signs in, rather than left orphaned or silently discarded.
 */
export async function resolveCartContext(event: H3Event): Promise<ResolvedCartContext> {
  const authSession = await getAuthSession(event).catch(() => null)
  const userId = authSession?.user?.id as string | undefined

  if (userId) {
    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.user, userId), eq(cart.status, 'active')))
      .limit(1)

    if (existing) {
      return { cartId: existing.id, userId }
    }

    // A guest cart from before this visitor signed in — claim it instead
    // of starting a new, empty one and losing what they already added.
    const guestId = getCookie(event, GUEST_COOKIE_NAME)
    if (guestId) {
      const [guestCart] = await db
        .select()
        .from(cart)
        .where(and(eq(cart.sessionId, guestId), eq(cart.status, 'active')))
        .limit(1)

      if (guestCart) {
        await db.update(cart).set({ user: userId, dateUpdated: new Date() }).where(eq(cart.id, guestCart.id))
        return { cartId: guestCart.id, userId }
      }
    }

    const [created] = await db
      .insert(cart)
      .values({ user: userId, status: 'active', currency: 'USD', subtotal: 0, total: 0 })
      .returning()

    return { cartId: created!.id, userId }
  }

  // Guest checkout: identify the cart by a random id in an httpOnly cookie.
  const existingGuestId = getCookie(event, GUEST_COOKIE_NAME)
  if (existingGuestId) {
    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.sessionId, existingGuestId), eq(cart.status, 'active')))
      .limit(1)

    if (existing) {
      return { cartId: existing.id }
    }
  }

  const guestId = crypto.randomUUID()
  setCookie(event, GUEST_COOKIE_NAME, guestId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: GUEST_COOKIE_MAX_AGE,
  })

  const [created] = await db
    .insert(cart)
    .values({ sessionId: guestId, status: 'active', currency: 'USD', subtotal: 0, total: 0 })
    .returning()

  return { cartId: created!.id }
}

// Gift card SKUs per backend, cached briefly: checked on every cart add.
const GIFT_CARD_TTL_MS = 5 * 60 * 1000
const giftCardSkus = new Map<string, { at: number, skus: Promise<Set<string>> }>()

function isGiftCard(backend: CommerceBackendAdapter, key: string): Promise<boolean> {
  if (typeof backend.giftCardProducts !== 'function') return Promise.resolve(false)
  let entry = giftCardSkus.get(backend.id)
  if (!entry || Date.now() - entry.at > GIFT_CARD_TTL_MS) {
    const skus = backend.giftCardProducts()
      .then((products) => new Set(products.map((p: { sku?: string | null }) => String(p?.sku ?? '')).filter(Boolean)))
      .catch(() => {
        giftCardSkus.delete(backend.id)
        return new Set<string>()
      })
    entry = { at: Date.now(), skus }
    giftCardSkus.set(backend.id, entry)
  }
  return entry.skus.then((skus) => skus.has(key))
}

export interface ResolvedProduct {
  /** The cart/checkout key: the Directus id, or `<backend>:<key>`. */
  id: string
  name: string
  price: number
  image: string | null
  /** The Directus products row (cart_items.products FK), if it is one. */
  directusId: number | null
  /** The commerce backend that owns it (e.g. 'magento'), if not Directus. */
  backend: string | null
  /** The product's key in that backend (e.g. its SKU). */
  key: string
  /** False for items that never ship (virtual/downloadable backend
   *  products); checkout then skips the address and shipping steps. */
  requiresShipping: boolean
}

/**
 * Looks up a product's authoritative name/price/image — from Directus by
 * id, or from the commerce backend that owns it (`magento:<sku>`, see
 * productRef.ts) — the same trusted, server-resolved source
 * checkout-session.post.ts prices from. A client-supplied price is never
 * used to populate a cart line item.
 */
export async function resolveProductForCart(productId: string): Promise<ResolvedProduct | null> {
  const ref = parseProductRef(productId)
  if (!ref) return null
  if (ref.kind === 'backend') {
    // A gift card needs an amount and a recipient that this checkout doesn't
    // collect; the store couldn't issue the card after PayPal took the money.
    if (await isGiftCard(ref.backend, ref.key)) {
      throw createError({ statusCode: 409, statusMessage: "Gift cards can't be bought here yet" })
    }
    const product = await ref.backend
      .request({ method: 'GET', collection: 'products', key: ref.key })
      .catch(() => null) as { sku?: string, name?: string, price?: number | string, image?: string | null, status?: string, requires_shipping?: boolean } | null
    const price = Number(product?.price)
    if (!product || !Number.isFinite(price) || product.status === 'draft') return null
    return {
      id: `${ref.backend.id}:${ref.key}`,
      name: product.name || ref.key,
      price,
      image: typeof product.image === 'string' ? product.image : null,
      directusId: null,
      backend: ref.backend.id,
      key: ref.key,
      requiresShipping: product.requires_shipping !== false,
    }
  }
  productId = ref.id

  const directus = getDirectusFacade()
  const product = await directus
    .request(
      readItem('products', productId, {
        fields: ['id', 'name', 'price', 'image.filename_disk', 'source', 'mageos_sku'],
      }),
    )
    .catch(() => null) as { id: string; name?: string; price?: number | string; image?: { filename_disk?: string }; source?: string | null; mageos_sku?: string | null } | null

  // A row the Mage-OS sync Flow mirrored from the store: the store sells it
  // (its live price, and the order is recorded there), whatever key the page used.
  if (product?.source === 'magento' && product.mageos_sku) {
    return resolveProductForCart(`magento:${product.mageos_sku}`)
  }

  // Directus serializes decimal columns as strings, so this must be
  // coerced rather than checked with typeof.
  const price = Number(product?.price)
  if (!product || !Number.isFinite(price)) {
    return null
  }

  const image = product.image?.filename_disk
    ? `${process.env.DIRECTUS_URL}/assets/${product.image.filename_disk}`
    : null

  return {
    id: String(product.id),
    name: product.name || String(product.id),
    price,
    image,
    directusId: Number(product.id),
    backend: null,
    key: String(product.id),
    // Directus products don't say whether they ship; assume they do.
    requiresShipping: true,
  }
}

export async function getCartItems(cartId: number) {
  return db.select().from(cartItems).where(eq(cartItems.cart, cartId))
}

/**
 * Recomputes and persists `cart.subtotal`/`total`/`total_price` from its
 * current line items — called after every add/update/remove so the cart
 * row itself never drifts out of sync with its items.
 */
export async function recomputeCartTotals(cartId: number) {
  const items = await getCartItems(cartId)
  const subtotalCents = items.reduce((sum, item) => sum + (item.total ?? 0), 0)

  await db
    .update(cart)
    .set({
      subtotal: subtotalCents,
      total: subtotalCents,
      totalPrice: subtotalCents / 100,
      dateUpdated: new Date(),
    })
    .where(eq(cart.id, cartId))

  return subtotalCents
}

export async function getCartWithItems(cartId: number) {
  const [cartRow] = await db.select().from(cart).where(eq(cart.id, cartId)).limit(1)
  const items = await getCartItems(cartId)
  return { cart: cartRow ?? null, items }
}

/**
 * Shapes a cart + its line items for the frontend store — prices/totals
 * are stored in the DB as integer cents, converted back to a decimal
 * amount here since every existing consumer (cart flyout, cart page,
 * checkout) does `qty * price` expecting a plain dollar amount.
 */
export async function serializeCart(cartId: number) {
  const { cart: cartRow, items } = await getCartWithItems(cartId)

  return {
    id: cartRow?.id ?? cartId,
    currency: cartRow?.currency ?? 'USD',
    items: items.map((item) => ({
      key: String(item.id),
      id: String(item.id),
      productId: item.productId ?? (item.products != null ? String(item.products) : ''),
      sku: item.productId ?? '',
      variant: item.variant ?? undefined,
      variantId: item.variantId ?? undefined,
      name: (item.metadata as any)?.name ?? '',
      image: (item.metadata as any)?.image ?? null,
      requiresShipping: (item.metadata as any)?.requiresShipping !== false,
      price: (item.price ?? 0) / 100,
      quantity: item.quantity ?? 0,
      qty: item.quantity ?? 0,
    })),
    subtotal: (cartRow?.subtotal ?? 0) / 100,
    total: (cartRow?.total ?? 0) / 100,
  }
}
