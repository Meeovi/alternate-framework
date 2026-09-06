import { defineStore } from '#imports'
import { ref, computed, type Ref } from 'vue'

// The cart is server-persisted (see layers/commerce/server/api/commerce/cart/
// and server/utils/cart.ts) — every mutation round-trips to the database
// (an httpOnly cookie identifies a guest's cart; a signed-in user's cart is
// looked up by their account, and a guest cart is claimed on sign-in) and
// the full, authoritative cart comes back in the response, which is what
// `items` is always set from. There's deliberately no local optimistic
// merge/patch logic here — the DB is the single source of truth, the same
// way checkout already re-prices everything server-side rather than
// trusting anything the client remembers.

// Nuxt's generated route types augment $fetch's return type at app-build
// time, but this package's own standalone `tsc` build (run as an npm
// `prepare` step, so it fires on every `npm install`) has no access to
// that generated map and infers `{}` for these routes, breaking `.items`
// access below. Annotate explicitly rather than relying on it.
type CartResponse = { items?: any[] }

export const useCartStore = defineStore('cart', () => {
  const items: Ref<any[]> = ref([])
  const loading = ref(true)
  const error: Ref<string | null> = ref(null)
  let inFlight: Promise<void> | null = null

  // Every consumer that needs the cart on mount (the cart page, the cart
  // flyout, every product card's add-to-cart button — there can be dozens
  // on one listing page) calls this itself from its own onMounted rather
  // than relying on a single fetch fired once from the store's own setup().
  // The two are not equivalent: a background fetch kicked off as a bare
  // side effect inside a Pinia store's setup — with no component's mount
  // lifecycle driving it — was confirmed live, repeatedly, not to
  // reliably repaint *other* already-mounted components once it resolved
  // (the store's own state read back correctly the whole time; the DOM
  // just never caught up). Triggering it from each consumer's onMounted
  // uses the same ordinary, always-reliable pattern this app already
  // relies on elsewhere (e.g. FollowButton.vue). Concurrent callers within
  // the same tick — the dozens-of-add-to-cart-buttons case — share one
  // in-flight request rather than each firing their own.
  async function fetchCart() {
    if (inFlight) return inFlight

    error.value = null
    inFlight = (async () => {
      try {
        const cart = await $fetch<CartResponse>('/api/commerce/cart')
        items.value = cart?.items ?? []
      } catch (err: any) {
        error.value = err?.data?.statusMessage || err?.message || 'Failed to load cart'
      } finally {
        loading.value = false
        inFlight = null
      }
    })()

    return inFlight
  }

  async function addItem(item: any) {
    loading.value = true
    error.value = null
    try {
      const productId = String(item.productId ?? item.id)
      const quantity = Number(item.qty ?? item.quantity ?? 1)
      const cart = await $fetch<CartResponse>('/api/commerce/cart/items', {
        method: 'POST',
        body: {
          productId,
          quantity,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          ...(item.variant ? { variant: item.variant } : {}),
        },
      })
      items.value = cart?.items ?? []
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to add item to cart'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItemByKey(key: string) {
    loading.value = true
    error.value = null
    try {
      const cart = await $fetch<CartResponse>(`/api/commerce/cart/items/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      items.value = cart?.items ?? []
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to remove item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateQuantity(key: string, quantity: number) {
    loading.value = true
    error.value = null
    try {
      const cart = await $fetch<CartResponse>(`/api/commerce/cart/items/${encodeURIComponent(key)}`, {
        method: 'PATCH',
        body: { quantity },
      })
      items.value = cart?.items ?? []
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to update quantity'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    error.value = null
    try {
      const cart = await $fetch<CartResponse>('/api/commerce/cart/clear', { method: 'POST' })
      items.value = cart?.items ?? []
    } catch (err: any) {
      error.value = err?.data?.statusMessage || err?.message || 'Failed to clear cart'
      throw err
    } finally {
      loading.value = false
    }
  }

  const itemCount = computed(() => items.value.length)

  const total = computed(() =>
    items.value.reduce((sum: number, item: any) => {
      const qty = Number(item.qty ?? item.quantity ?? 0)
      const price = Number(item.price ?? 0)
      return sum + qty * price
    }, 0),
  )

  // Every "go to checkout" trigger in the app should call this rather than
  // hitting the payment API directly — it hands off to the single routed
  // checkout page, which creates the session and mounts Stripe's embedded
  // checkout. The server re-prices every item from the catalog itself, so
  // nothing here needs (or should send) a price.
  async function createCheckoutSession() {
    if (items.value.length === 0) {
      throw new Error('Cart is empty')
    }
    return navigateTo('/checkout')
  }

  return {
    items,
    loading,
    error,
    itemCount,
    total,
    fetchCart,
    addItem,
    removeItemByKey,
    updateQuantity,
    clearCart,
    createCheckoutSession,
  }
})
