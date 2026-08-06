import { defineStore } from '#imports'
import { ref, computed, readonly, type Ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items: Ref<any[]> = ref([])
  const loading = ref(false)
  const error = ref(null)

  function addItem(item: any) {
    const existingIndex = items.value.findIndex(
      (existing) => existing.productId === item.productId || existing.id === item.id,
    )
    if (existingIndex >= 0) {
      const next = [...items.value]
      const current = next[existingIndex]
      const incomingQty = Number(item.qty ?? item.quantity ?? 1)
      next[existingIndex] = {
        ...current,
        ...item,
        quantity: (current.qty ?? current.quantity ?? 0) + incomingQty,
        qty: (current.qty ?? current.quantity ?? 0) + incomingQty,
      }
      items.value = next
    } else {
      const incomingQty = Number(item.qty ?? item.quantity ?? 1)
      items.value.push({
        ...item,
        qty: incomingQty,
        quantity: incomingQty,
        key: item.key ?? item.id ?? `cart-${Date.now()}-${Math.random()}`,
      })
    }
  }

  function removeItemByKey(key: string) {
    const next = items.value.filter((item) => item.key !== key)
    items.value = next
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      items.value = items.value.filter((item) => item.key !== key)
      return
    }
    const next = items.value.map((item) =>
      item.key === key ? { ...item, quantity, qty: quantity } : item,
    )
    items.value = next
  }

  function clearCart() {
    items.value = []
  }

  const itemCount = computed(() => items.value.length)

  const total = computed(() =>
    items.value.reduce((sum, item) => {
      const qty = Number(item.qty ?? item.quantity ?? 0)
      const price = Number(item.price ?? 0)
      return sum + qty * price
    }, 0),
  )

  return {
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    itemCount,
    total,
    addItem,
    removeItemByKey,
    updateQuantity,
    clearCart,
  }
})