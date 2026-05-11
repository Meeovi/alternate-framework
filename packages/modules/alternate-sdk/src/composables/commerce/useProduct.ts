import { ref } from 'vue'

export function useProduct() {
  const product = ref(null)
  const loading = ref(false)

  async function fetchProduct(id: string) {
    loading.value = true
    const res = await sdk.getProduct({ id })
    product.value = res.product
    loading.value = false
  }

  return { product, fetchProduct, loading }
}
