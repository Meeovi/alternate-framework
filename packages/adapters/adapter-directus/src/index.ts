// packages/adapters/adapter-directus/src/index.ts
import { GraphQLClient } from 'graphql-request'
import type { Query } from './graphql/schema-types'

type CleanCollectionKeys = keyof Query extends infer K
  ? K extends `Directus_${infer BaseName}`
    ? BaseName
    : never
  : never;

type UnpackArray<T> = T extends (infer U)[] 
  ? U extends null | undefined ? never : U
  : T extends null | undefined ? never : T;

export class DirectusAdapter {
  private endpoint: string
  private token?: string
  private client: GraphQLClient

  // Namespace our calls to replicate your custom SDK tree structure
  public content = {
    /**
     * Reads a specific dynamic collection item matching your SDK wrapper signature.
     * Handles routing transforms transparently behind the scenes.
     */
    readItem: async <
      CollectionName extends CleanCollectionKeys,
      MeshKey extends `Directus_${CollectionName}` & keyof Query = `Directus_${CollectionName}` & keyof Query,
      CollectionType = UnpackArray<Query[MeshKey]>,
      FieldsParam = string[] | Record<string, any>[] | any
    >(
      collection: CollectionName,
      id: string | number,
      options?: { fields?: FieldsParam }
    ): Promise<Partial<CollectionType>> => {
      const fields = this.normalizeFields((options as any)?.fields || ['*'])
      const data = await this.restGet(`/items/${collection}/${id}`, {
        fields: this.serializeFields(fields),
      })
      const item = data?.data || data
      return this.normalizeResponse(item) as Partial<CollectionType>
    },

    getItem: async (collection: string, id: string | number, options: Record<string, any> = {}) => {
      return this.content.readItem(collection as any, id, options)
    },

    readItems: async (collection: string, options: Record<string, any> = {}): Promise<any[]> => {
      const fields = this.normalizeFields(options.fields || ['*'])
      const params: Record<string, any> = {
        fields: this.serializeFields(fields),
      }
      if (options.filter) params.filter = JSON.stringify(options.filter)
      if (options.limit) params.limit = String(options.limit)
      if (options.offset) params.offset = String(options.offset)
      if (options.page) params.page = String(options.page)
      if (options.search) params.search = String(options.search)
      if (options.sort) params.sort = Array.isArray(options.sort) ? options.sort.join(',') : String(options.sort)

      const data = await this.restGet(`/items/${collection}`, params)
      const items = data?.data || data
      return this.normalizeResponse(Array.isArray(items) ? items : [items])
    },

    getItems: async (collection: string, options: Record<string, any> = {}) => {
      return this.content.readItems(collection, options)
    },

    createItem: async (collection: string, data: Record<string, any>) => {
      const result = await this.restPost(`/items/${collection}`, { data })
      return result?.data || result
    },

    request: async (query: string) => {
      return this.client.request<Record<string, any>>(query)
    },

    getAssetUrl: (file: unknown): string => {
      const endpoint = this.endpoint.replace(/\/$/, '')
      if (!file) return ''
      const filename = typeof file === 'object'
        ? (file as any).filename_download || (file as any).filename || (file as any).id
        : String(file)
      if (!filename) return ''
      return `${endpoint}/assets/${filename}`
    },
  }

  constructor(endpoint: string, token?: string) {
    this.endpoint = endpoint.replace(/\/$/, '')
    this.token = token
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  private normalizeFields(fields: any): any[] {
    if (!Array.isArray(fields)) return ['*']
    return fields.map((field) => {
      if (typeof field === 'string') return field
      if (typeof field === 'object' && field !== null) {
        return Object.entries(field).map(([key, nested]) => ({
          [key]: this.normalizeFields(Array.isArray(nested) ? nested : [nested]),
        }))
      }
      return field
    })
  }

  private serializeFields(fields: any[]): string {
    const parts: string[] = []
    for (const field of fields) {
      if (typeof field === 'string') {
        parts.push(field)
      } else if (typeof field === 'object' && field !== null) {
        for (const [key, nested] of Object.entries(field)) {
          const nestedFields = Array.isArray(nested) ? nested : [nested]
          parts.push(`${key}.${this.serializeFields(nestedFields)}`)
        }
      }
    }
    return parts.join(',')
  }

  private async restGet(path: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.endpoint}${path}`)
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Directus REST error ${response.status}: ${text}`)
    }

    return response.json()
  }

  private async restPost(path: string, body: any): Promise<any> {
    const url = new URL(`${this.endpoint}${path}`)
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Directus REST error ${response.status}: ${text}`)
    }

    return response.json()
  }

  private normalizeResponse(data: any, inMediaArray = false): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeResponse(item, inMediaArray))
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result: Record<string, any> = {}
      for (const [key, value] of Object.entries(data)) {
        if (key === 'directus_files_id' && inMediaArray) {
          result.file = this.normalizeResponse(value, false)
        } else {
          const nextInMedia = inMediaArray || key === 'media'
          result[key] = this.normalizeResponse(value, nextInMedia)
        }
      }
      return result
    }
    return data
  }
}

// Export the raw Schema Types so other adapters can import them!
export type { Query } from './graphql/schema-types'
