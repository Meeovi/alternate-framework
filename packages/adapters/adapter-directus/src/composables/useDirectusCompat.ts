import { ref, type Ref } from 'vue'

export interface DirectusCompatAuthState<TUser = unknown> {
  user: Ref<TUser | null>
}

export interface DirectusCompatContentAdapter {
  readMany: (collection: string, opts?: unknown) => Promise<unknown>
  createItem: (collection: string, payload: unknown) => Promise<unknown>
  updateItem?: (collection: string, id: string | number, payload?: unknown) => Promise<unknown>
  deleteItem?: (collection: string, id: string | number) => Promise<unknown>
  readOne?: (collection: string, id: string | number, opts?: unknown) => Promise<unknown>
}

export interface DirectusCompatItemsApi {
  readByQuery: (opts?: unknown) => Promise<{ data: unknown[] }>
  list: (opts?: unknown) => Promise<{ data: unknown[] }>
  create: (payload: unknown) => Promise<unknown>
  update: (id: string | number, payload?: unknown) => Promise<unknown>
  delete: (id: string | number) => Promise<unknown>
  readOne: (id: string | number, opts?: unknown) => Promise<unknown>
}

export interface DirectusCompatClient {
  get: (collection: string, opts?: unknown) => Promise<unknown>
  post: (collection: string, payload: unknown) => Promise<unknown>
  items: (collection: string) => DirectusCompatItemsApi
}

export function createDirectusAuthState<TUser = unknown>(initialUser: TUser | null = null): DirectusCompatAuthState<TUser> {
  const user = ref<TUser | null>(initialUser) as Ref<TUser | null>
  return { user }
}

export function createDirectusCompatClient(content: DirectusCompatContentAdapter): DirectusCompatClient {
  return {
    async get(collection: string, opts?: unknown) {
      return await content.readMany(collection, opts)
    },

    async post(collection: string, payload: unknown) {
      return await content.createItem(collection, payload)
    },

    items(collection: string): DirectusCompatItemsApi {
      return {
        async readByQuery(opts?: unknown) {
          const data = await content.readMany(collection, opts)
          return { data: Array.isArray(data) ? data : [] }
        },

        async list(opts?: unknown) {
          const data = await content.readMany(collection, opts)
          return { data: Array.isArray(data) ? data : [] }
        },

        async create(payload: unknown) {
          return await content.createItem(collection, payload)
        },

        async update(id: string | number, payload?: unknown) {
          if (!content.updateItem)
            throw new Error('updateItem is not supported by the current content adapter')
          return await content.updateItem(collection, id, payload)
        },

        async delete(id: string | number) {
          if (!content.deleteItem)
            throw new Error('deleteItem is not supported by the current content adapter')
          return await content.deleteItem(collection, id)
        },

        async readOne(id: string | number, opts?: unknown) {
          if (content.readOne)
            return await content.readOne(collection, id, opts)
          const data = await content.readMany(collection, opts)
          return Array.isArray(data) ? data[0] ?? null : null
        },
      }
    },
  }
}