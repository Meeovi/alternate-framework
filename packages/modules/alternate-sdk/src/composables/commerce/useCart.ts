import { ref } from 'vue'

export function useCart() {
  const cart = ref(null)
  const loading = ref(false)

  async function fetchCart(id: string) {
    loading.value = true
    const res = await sdk.getCart({ id })
    cart.value = res.cart
    loading.value = false
  }

  return { cart, fetchCart, loading }
}