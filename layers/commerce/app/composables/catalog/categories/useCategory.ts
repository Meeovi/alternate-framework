import type { SfCategory, SfCategoryTree } from '~/composables/system/models'
import { getCommerceClient } from '../../../utils/client'
import type { Ref } from 'vue'
import type { Maybe } from '~/composables/system/models/shared'

export function useCategory() {
  const client = getCommerceClient()

  const getCategory = async (categoryId: string): Promise<Maybe<SfCategory>> => {
    try {
      const { data } = await useAsyncData(
        `category-${categoryId}`,
        () => client.getCategory?.(categoryId) ?? client.categories?.retrieve?.(categoryId),
      )
      return (data.value as Maybe<SfCategory>) ?? null
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  const getCategoryBySlug = async (slug: string): Promise<Maybe<SfCategory>> => {
    try {
      const categories = await client.getCategories?.({ filters: { slugs: [slug] } })
      const list = Array.isArray(categories)
        ? categories
        : categories?.categories || categories?.items || []
      const found = Array.isArray(list) ? list.find((c: any) => c?.slug === slug) : null
      if (found) return found as SfCategory
      throw new Error(`Category with slug "${slug}" not found.`)
    } catch (error) {
      console.error('Error fetching category by slug:', error)
      throw error
    }
  }

  const getCategoryById = async (categoryId: string): Promise<Maybe<SfCategory>> => {
    try {
      const { data } = await useAsyncData(
        `categoryById-${categoryId}`,
        () => client.getCategory?.(categoryId) ?? client.categories?.retrieve?.(categoryId),
      )
      return (data.value as Maybe<SfCategory>) ?? null
    } catch (error) {
      console.error('Error fetching category by ID:', error)
      throw error
    }
  }

  const getCategories = async (): Promise<SfCategory[]> => {
    try {
      const categories = await client.getCategories?.() ?? client.categories?.list?.()
      const list = Array.isArray(categories)
        ? categories
        : categories?.categories || categories?.items || []
      return Array.isArray(list) ? list : []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  const getCategoryTree = async (): Promise<Maybe<SfCategoryTree[]>> => {
    try {
      const { data } = await useAsyncData(
        'category-tree',
        () => client.getCategoryTree?.(),
      )
      return (data.value as Maybe<SfCategoryTree[]>) ?? null
    } catch (error) {
      console.error('Error fetching category tree:', error)
      throw error
    }
  }

  const getCategoryProducts = async (categoryId: string): Promise<{
    items: any[]
    pagination?: Record<string, any>
    aggregations?: any[]
  }> => {
    try {
      const { data } = await useAsyncData(
        `category-products-${categoryId}`,
        () => client.getCategoryProducts?.({ categoryId }) ?? client.searchProducts?.({ category: [categoryId] }),
      )
      return (data.value as any) ?? { items: [] }
    } catch (error) {
      console.error('Error fetching category products:', error)
      throw error
    }
  }

  return {
    getCategory,
    getCategoryBySlug,
    getCategoryById,
    getCategories,
    getCategoryTree,
    getCategoryProducts,
  }
}

export default useCategory
