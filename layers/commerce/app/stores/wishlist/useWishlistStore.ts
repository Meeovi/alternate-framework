import { defineStore } from '#imports'
import { ref, computed, type Ref } from 'vue'

/**
 * The wishlist is a list of type "Wishlist" (layers/social,
 * /api/social/wishlist): signed in, the heart saves into it. Signed out (or
 * in an app without the social layer) items are kept in this browser and
 * moved into the list the next time the user is signed in.
 *
 * Items are product keys: a Directus product's id, or `<backend>:<sku>`
 * (utils/productKey.ts).
 */

const WISHLIST_STORAGE_KEY = 'wishlist:items'
const API = '/api/social/wishlist'

function loadLocal(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function saveLocal(items: string[]) {
  if (typeof window === 'undefined') return
  try {
    if (items.length) localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    else localStorage.removeItem(WISHLIST_STORAGE_KEY)
  } catch {
    // Storage can fail (quota, private browsing) — the wishlist still
    // works for the current tab, it just won't survive a reload.
  }
}

type WishlistResponse = { list: { id: number, slug: string, name: string } | null, items: string[] }

export const useWishlistStore = defineStore('wishlist', () => {
  const items: Ref<string[]> = ref(loadLocal())
  /** The wishlist list's slug (/lists/list/<slug>), once it exists. */
  const listSlug = ref<string | null>(null)
  /** True once the server wishlist answered; false = this browser only. */
  const remote = ref(false)
  const loaded = ref(false)
  let loading: Promise<void> | null = null

  const itemCount = computed(() => items.value.length)

  function apply(response: WishlistResponse) {
    items.value = response.items.map(String)
    listSlug.value = response.list?.slug ?? null
  }

  /** Reads the server wishlist (once), moving this browser's items into it. */
  function load(force = false): Promise<void> {
    if (loading && !force) return loading
    loading = (async () => {
      try {
        apply(await $fetch<WishlistResponse>(API))
        remote.value = true
        const local = loadLocal().filter((key) => !items.value.includes(key))
        if (local.length) {
          apply(await $fetch<WishlistResponse>(API, { method: 'POST', body: { productKeys: local.slice(0, 50) } }))
        }
        saveLocal([])
      } catch {
        // Signed out, or no social layer: keep the browser's wishlist.
        remote.value = false
        items.value = loadLocal()
      } finally {
        loaded.value = true
      }
    })()
    return loading
  }

  function hasItem(productKey: string | number) {
    return items.value.includes(String(productKey))
  }

  async function addItem(productKey: string | number) {
    const key = String(productKey)
    if (!key || hasItem(key)) return
    items.value = [...items.value, key]
    if (!remote.value) return saveLocal(items.value)
    try {
      apply(await $fetch<WishlistResponse>(API, { method: 'POST', body: { productKeys: [key] } }))
    } catch {
      items.value = items.value.filter((existing) => existing !== key)
    }
  }

  async function removeItem(productKey: string | number) {
    const key = String(productKey)
    const before = items.value
    items.value = items.value.filter((existing) => existing !== key)
    if (!remote.value) return saveLocal(items.value)
    try {
      apply(await $fetch<WishlistResponse>(API, { method: 'DELETE', body: { productKey: key } }))
    } catch {
      items.value = before
    }
  }

  function toggleItem(productKey: string | number) {
    return hasItem(productKey) ? removeItem(productKey) : addItem(productKey)
  }

  return {
    items,
    itemCount,
    listSlug,
    remote,
    loaded,
    load,
    hasItem,
    addItem,
    removeItem,
    toggleItem,
  }
})

export default useWishlistStore
