import { useDirectus, useRuntimeConfig } from '#imports'

type QueryParams = Record<string, any>

function normalizeDirectusParams(params: QueryParams = {}) {
  const query: QueryParams = { ...params }

  if (query.filter && typeof query.filter === 'object') {
    query.filter = JSON.stringify(query.filter)
  }

  if (query.deep && typeof query.deep === 'object') {
    query.deep = JSON.stringify(query.deep)
  }

  return query
}

export function useContentRequest() {
  const directus = useDirectus()
  const runtimeConfig = useRuntimeConfig()

  const readItems = async (collection: string, params: QueryParams = {}) => {
    const response = await directus<{ data?: any[] }>(`/items/${collection}`, {
      method: 'GET',
      params: normalizeDirectusParams(params),
    })

    return Array.isArray(response?.data) ? response.data : []
  }

  const readItem = async (collection: string, id: string | number, params: QueryParams = {}) => {
    const response = await directus<{ data?: any }>(`/items/${collection}/${id}`, {
      method: 'GET',
      params: normalizeDirectusParams(params),
    })

    return response?.data || null
  }

  const readFieldsByCollection = async (collection: string, params: QueryParams = {}) => {
    const response = await directus<{ data?: any[] }>(`/fields/${collection}`, {
      method: 'GET',
      params: normalizeDirectusParams(params),
    })

    return Array.isArray(response?.data) ? response.data : []
  }

  const createItem = async (collection: string, payload: QueryParams) => {
    const response = await directus<{ data?: any }>(`/items/${collection}`, {
      method: 'POST',
      body: payload,
    })

    return response?.data || null
  }

  const updateItem = async (collection: string, id: string | number, payload: QueryParams = {}) => {
    const response = await directus<{ data?: any }>(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: payload,
    })

    return response?.data || null
  }

  const deleteItem = async (collection: string, id: string | number) => {
    await directus(`/items/${collection}/${id}`, {
      method: 'DELETE',
    })

    return true
  }

  const uploadFiles = async (formData: FormData) => {
    const response = await directus<{ data?: any }>('/files', {
      method: 'POST',
      body: formData,
    })

    return response?.data || null
  }

  const getAssetUrl = (file: any) => {
    const directusUrl = String(runtimeConfig.public?.directus?.url || '').replace(/\/$/, '')
    const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file

    if (!directusUrl || !fileId) {
      return ''
    }

    return `${directusUrl}/assets/${fileId}`
  }

  const request = async (path: string, options: QueryParams = {}, useStaticToken = true) => {
    return directus(path, options, useStaticToken)
  }

  return {
    request,
    readItems,
    readItem,
    readFieldsByCollection,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    getAssetUrl,
  }
}

export default useContentRequest
