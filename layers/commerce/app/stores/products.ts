// stores/products.ts - Pinia store for product management
import type { Product } from '../types/commerce.type'
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
// import { useProducts } from '../composables/catalog/products'
import { useFeaturedProducts } from '../composables/catalog/products/useProducts/featured-products'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const featuredProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const categories = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Import product composables
  const { getFeaturedProducts } = useFeaturedProducts()
  
  const fetchProducts = async (options: any = {}) => {
    loading.value = true
    error.value = null
    try {
      // products.value = await getProducts(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      // currentProduct.value = await getProductById(id)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching product:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchFeaturedProducts = async (options: any = {}) => {
    loading.value = true
    error.value = null
    try {
      featuredProducts.value = await getFeaturedProducts(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching featured products:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchProductsByCategory = async (categoryId: string, options: any = {}) => {
    loading.value = true
    error.value = null
    try {
      await fetchProductsByCategory(categoryId, options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching products by category:', err)
    } finally {
      loading.value = false
    }
  }
  
  const searchForProducts = async (query: string, options: any = {}) => {
    loading.value = true
    error.value = null
    try {
      await searchForProducts(query, options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error searching products:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Computed properties
  const productsOnSale = computed(() => {
    return products.value.filter((product: Product) => {
      if ((product as any).sale_price == null) return false
      const priceValue = (product as any).price?.value ?? (typeof (product as any).price === 'number' ? (product as any).price : undefined)
      return priceValue != null && (product as any).sale_price < priceValue
    })
  })
  
  const productCount = computed(() => {
    return products.value.length
  })
  
  return {
    // State
    products: readonly(products),
    featuredProducts: readonly(featuredProducts),
    currentProduct: readonly(currentProduct),
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    productsOnSale,
    productCount,
    
    // Actions
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    fetchProductsByCategory,
    searchForProducts
  }
})