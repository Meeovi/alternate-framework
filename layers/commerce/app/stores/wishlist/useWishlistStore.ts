import { defineStore } from '#imports'
import { ref, computed, type Ref } from 'vue'

const WISHLIST_STORAGE_KEY = 'wishlist:items'

function loadPersistedItems(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function persist(items: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage can fail (quota, private browsing) — the wishlist still
    // works for the current tab, it just won't survive a reload.
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items: Ref<string[]> = ref(loadPersistedItems())

  const itemCount = computed(() => items.value.length)

  function hasItem(productId: string | number) {
    return items.value.includes(String(productId))
  }

  function addItem(productId: string | number) {
    const id = String(productId)
    if (!items.value.includes(id)) {
      items.value = [...items.value, id]
      persist(items.value)
    }
  }

  function removeItem(productId: string | number) {
    const id = String(productId)
    items.value = items.value.filter((existing: string) => existing !== id)
    persist(items.value)
  }

  function toggleItem(productId: string | number) {
    if (hasItem(productId)) {
      removeItem(productId)
    } else {
      addItem(productId)
    }
  }

  return {
    items,
    itemCount,
    hasItem,
    addItem,
    removeItem,
    toggleItem,
  }
})

export default useWishlistStore
