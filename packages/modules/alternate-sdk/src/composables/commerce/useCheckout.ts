import { ref } from 'vue'

export function useCheckout() {
  const checkout = ref(null)
  const loading = ref(false)

  async function fetchCheckout(id: string) {
    loading.value = true
    const res = await sdk.getCheckout({ id })
    checkout.value = res.checkout
    loading.value = false
  }

  return { checkout, fetchCheckout, loading }
}