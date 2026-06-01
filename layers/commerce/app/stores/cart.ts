import { defineStore } from '#imports'
import { ref, computed, readonly, type Ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items: Ref<any[]> = ref([])
  const loading = ref(false)
  const error = ref(null)

  function addItem(item: any) {
    items.value.push(item)
  }

  function removeItem(index: number) {
    items.value.splice(index, 1)
  }

  function clearCart() {
    items.value = []
  }

  const itemCount = computed(() => items.value.length)

  return {
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    itemCount,
    addItem,
    removeItem,
    clearCart
  }
})