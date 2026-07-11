// layers/commerce/app/composables/catalog/categories/useCategories.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { CategoryProvider, Category, CategoryTreeNode } from '../../../types/categories'

/**
 * Category composable. Replaces the old `useCategory.ts` with a single, typed
 * entrypoint backed by `CategoryProvider`.
 */
export function useCategories() {
  const client = getCommerceClient() as unknown as CategoryProvider
  const categories = ref<Category[]>([])
  const tree = ref<CategoryTreeNode[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchCategories(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      categories.value = await client.getCategories(params)
    } catch (err) {
      error.value = err as Error
      categories.value = []
    } finally {
      isLoading.value = false
    }
    return categories.value
  }

  async function fetchCategoryTree(rootId?: string | null) {
    isLoading.value = true
    error.value = null
    try {
      tree.value = await client.getCategoryTree(rootId)
    } catch (err) {
      error.value = err as Error
      tree.value = []
    } finally {
      isLoading.value = false
    }
    return tree.value
  }

  async function fetchCategoryBySlug(slug: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.getCategoryBySlug(slug)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoryById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.getCategoryById(id)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    tree,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryTree,
    fetchCategoryBySlug,
    fetchCategoryById,
  }
}

export default useCategories
