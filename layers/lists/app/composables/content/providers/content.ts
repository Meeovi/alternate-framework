export const contentAdapter = {
  async readItem(collection: string, id: string | number, opts?: any) {
    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'readItem', collection, id, opts },
    })
  },
  async readItems(collection: string, opts?: any) {
    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'readItems', collection, opts },
    })
  },
  async readFieldsByCollection(collection: string, opts?: any) {
    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'readFieldsByCollection', collection, opts },
    })
  },
  async createItem(collection: string, data: any) {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      if (collection !== 'files') {
        throw new Error('FormData payloads are only supported for files collection')
      }

      return await $fetch('/api/lists/files/upload', {
        method: 'POST',
        body: data,
      })
    }

    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'createItem', collection, data },
    })
  },
  async updateItem(collection: string, id: string | number, data: any) {
    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'updateItem', collection, id, data },
    })
  },
  async deleteItem(collection: string, id: string | number) {
    return await $fetch('/api/lists/content', {
      method: 'POST',
      body: { operation: 'deleteItem', collection, id },
    })
  },
}

export default contentAdapter