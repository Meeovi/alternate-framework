import { defineStore } from 'pinia';
import type { CartItem, CartTotals } from '../types/commerce.type'
import { useGateway } from '../composables/useGateway'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const totals = ref<CartTotals | null>(null)

  const gateway = useGateway()

  async function load() {
    const cart = await gateway.cart.get()
    items.value = cart.items
    totals.value = cart.totals
  }

  async function add(productId: string, qty = 1) {
    await gateway.cart.add(productId, qty)
    await load()
  }

  async function remove(itemId: string) {
    await gateway.cart.remove(itemId)
    await load()
  }

  return { items, totals, load, add, remove }
})
