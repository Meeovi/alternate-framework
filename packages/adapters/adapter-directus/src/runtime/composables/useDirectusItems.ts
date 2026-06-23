import {
  DirectusItemRequest,
  DirectusItemMetaRequest,
  DirectusItemCreation,
  DirectusItemDeletion,
  DirectusItemUpdate,
  DirectusItems,
  DirectusItem
} from '../types/index'
import { useDirectus } from './useDirectus'

export const useDirectusItems = () => {
  const directus = useDirectus()

  async function getItems<T>(data: DirectusItemRequest): Promise<T[]>;
  async function getItems<T>(data: DirectusItemMetaRequest): Promise<DirectusItems<T>>;
  async function getItems<T>(data: DirectusItemRequest | DirectusItemMetaRequest): Promise<T[] | DirectusItems<T>> {
    try {
      if (data.params?.filter) {
        (data.params.filter as unknown) = JSON.stringify(data.params.filter)
      }
      if (data.params?.deep) {
        (data.params.deep as unknown) = JSON.stringify(data.params.deep)
      }
      const items = await directus<DirectusItems<T>>(`/items/${data.collection}`, {
        method: 'GET',
        params: data.params
      })
      if (!items) return []
      if ('meta' in items && items.meta) return items
      return items.data ?? []
    } catch (e) {
      return []
    }
  }

  const getSingletonItem = async <T>(data: DirectusItemRequest): Promise<T | null> => {
    try {
      if (data.params?.filter) {
        (data.params.filter as unknown) = JSON.stringify(data.params.filter)
      }
      if (data.params?.deep) {
        (data.params.deep as unknown) = JSON.stringify(data.params.deep)
      }
      const items = await directus<{ data: T }>(`/items/${data.collection}`, {
        method: 'GET',
        params: data.params
      })
      return items.data ?? null
    } catch (e) {
      return null
    }
  }

  const getItemById = async <T>(data: DirectusItemRequest): Promise<T | null> => {
    try {
      if (data.params?.filter) {
        (data.params.filter as unknown) = JSON.stringify(data.params.filter)
      }
      if (data.params?.deep) {
        (data.params.deep as unknown) = JSON.stringify(data.params.deep)
      }
      const items = await directus<DirectusItem<T>>(
        `/items/${data.collection}/${data.id}`,
        {
          method: 'GET',
          params: data.params
        }
      )
      return items.data ?? null
    } catch (e) {
      return null
    }
  }

  const createItems = async <T>(data: DirectusItemCreation): Promise<T[]> => {
    try {
      const items = await directus<{ data: T[] }>(`/items/${data.collection}`, {
        method: 'POST',
        body: data.items,
        params: data.params
      })
      return items.data ?? []
    } catch (e) {
      return []
    }
  }

  const deleteItems = async (data: DirectusItemDeletion): Promise<boolean> => {
    try {
      await directus<void>(`/items/${data.collection}`, {
        method: 'DELETE',
        body: data.items
      })
      return true
    } catch (e) {
      return false
    }
  }

  const updateItem = async <T>(data: DirectusItemUpdate): Promise<T | null> => {
    try {
      const item = await directus<{ data: T }>(
        `/items/${data.collection}/${data.id}`,
        {
          method: 'PATCH',
          body: data.item,
          params: data.params
        }
      )
      return item?.data ?? null
    } catch (e) {
      return null
    }
  }

  return {
    getItems,
    getSingletonItem,
    getItemById,
    createItems,
    deleteItems,
    updateItem
  }
}