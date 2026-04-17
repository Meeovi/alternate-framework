import useContentAdapter from '../../../useContentAdapter'

export const directusContentAdapter = {
  async readItem(collection: string, id: string | number, opts?: any) {
    const content = useContentAdapter()
    return await content.readOne(collection, id, opts)
  },
  async readItems(collection: string, opts?: any) {
    const content = useContentAdapter()
    return await content.readMany(collection, opts)
  },
  async createItem(collection: string, data: any) {
    const content = useContentAdapter()
    return await content.createItem(collection, data)
  },
  async updateItem(collection: string, id: string | number, data: any) {
    const content = useContentAdapter()
    return await content.updateItem(collection, id, data)
  },
  async deleteItem(collection: string, id: string | number) {
    const content = useContentAdapter()
    return await content.deleteItem(collection, id)
  },
}

export default directusContentAdapter
