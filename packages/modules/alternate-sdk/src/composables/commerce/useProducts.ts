import { ref } from 'vue'

export function useProducts() {
  const products = ref(null)
  const loading = ref(false)

  async function fetchProducts(id: string) {
    loading.value = true
    const res = await sdk.getProducts({ id })
    products.value = res.products
    loading.value = false
  }

  return { products, fetchProducts, loading }
}
