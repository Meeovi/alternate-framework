import useAdapterRequest from '~/composables/useAdapterRequest'

declare const defineNuxtPlugin: any

export default defineNuxtPlugin(() => {
  const adapter = useAdapterRequest()

  const directusUrl = (globalThis as any).__directus?.url || ''

  return {
    provide: {
      readItems: (collection: string, opts?: any) => adapter.readItems(collection, opts),
      readItem: (collection: string, id: any, opts?: any) => adapter.readItem(collection, id, opts),
      readFieldsByCollection: (collection: string) => adapter.readFieldsByCollection(collection),
      createItem: (collection: string, payload: any) => adapter.createItem(collection, payload),
      updateItem: (collection: string, id: any, payload?: any) => adapter.updateItem(collection, id, payload),
      deleteItem: (collection: string, id: any) => adapter.deleteItem(collection, id),
      uploadFiles: (files: any) => adapter.uploadFiles(files),
      // Provide a minimal $directus compatibility object so existing code that calls
      // $directus.request($readItems(...)) continues to work. `request` will
      // resolve promises or return values directly.
      directus: {
        url: directusUrl,
        request: async (maybe: any) => {
          try {
            if (!maybe) return maybe
            if (typeof maybe === 'function') return await maybe()
            if (maybe && typeof maybe.then === 'function') return await maybe
            return maybe
          } catch (err) {
            // fallback: return as-is
            return maybe
          }
        }
      }
    }
  }
})
