// packages/adapters/adapter-directus/src/index.ts
import { GraphQLClient } from 'graphql-request'
import type { Query } from './graphql/schema-types'

type AnyRecord = Record<string, any>

export class DirectusAdapter {
  private endpoint: string
  private token?: string
  private client: GraphQLClient
  private schemaCache: Record<string, { fields: string[]; relations: Record<string, string> }> = {}
  private schemaReady = false

  // Namespace our calls to replicate your custom SDK tree structure
  public content = {
    readItem: async (collection: string, id: string | number, options: Record<string, any> = {}): Promise<any> => {
      const fields = this.normalizeFields(options.fields || ['*'])
      await this.ensureSchema(collection)
      const selection = await this.buildSelectionSet(collection, fields, 0)
      const query = `
        query GetDirectusItem {
          ${collection}_by_id(id: "${id}") {
            ${selection}
          }
        }
      `
      const result = await this.graphqlRequest<Record<string, any>>(query)
      const key = `${collection}_by_id`
      return this.normalizeResponse(result?.[key] || {})
    },

    getItem: async (collection: string, id: string | number, options: Record<string, any> = {}) => {
      return this.content.readItem(collection, id, options)
    },

    readItems: async (collection: string, options: Record<string, any> = {}): Promise<any[]> => {
      const fields = this.normalizeFields(options.fields || ['*'])
      await this.ensureSchema(collection)
      const selection = await this.buildSelectionSet(collection, fields, 0)

      const args: string[] = []
      if (options.filter) args.push(`filter: { ${this.buildGraphQLFilter(options.filter)} }`)
      if (options.limit) args.push(`limit: ${options.limit}`)
      if (options.offset) args.push(`offset: ${options.offset}`)
      if (options.page) args.push(`page: ${options.page}`)
      if (options.sort) args.push(`sort: ${JSON.stringify(Array.isArray(options.sort) ? options.sort : [options.sort])}`)

      const argsPart = args.length > 0 ? `(${args.join(', ')})` : ''
      const query = `
        query GetDirectusItems {
          ${collection}${argsPart} {
            ${selection}
          }
        }
      `

      const result = await this.graphqlRequest<Record<string, any>>(query)
      const items = result?.[collection]
      if (!Array.isArray(items)) return []
      return this.normalizeResponse(items)
    },

    getItems: async (collection: string, options: Record<string, any> = {}) => {
      return this.content.readItems(collection, options)
    },

    createItem: async (collection: string, data: Record<string, any>) => {
      const result = await this.restPost(`/items/${collection}`, { data })
      return result?.data || result
    },

    request: async (query: string) => {
      return this.graphqlRequest<Record<string, any>>(query)
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

    // Search namespace - implements SearchAdapter interface
    search: async (query: string, options?: Record<string, any>) => {
      const results = await this.content.readItems('page_blocks', {
        filter: { name: { _contains: query } },
        limit: options?.limit || 10,
      })
      return results
    },

    suggest: async (query: string) => {
      const results = await this.content.readItems('page_blocks', {
        filter: { name: { _contains: query } },
        limit: 5,
      })
      return results.map((item: any) => item.name).filter(Boolean)
    },

    index: async (doc: Record<string, any>) => {
      // Directus stores content directly; index is a no-op placeholder
    },

    stats: async () => {
      return { indexed: 0 }
    },

    clear: async () => {
      // No-op for Directus
    },

    // Auth namespace - implements AuthAdapter interface
    auth: {
      login: async (payload: Record<string, any>) => {
        const res = await this.restPost('/auth/login', { email: payload.email, password: payload.password })
        return res.data || res
      },

      logout: async () => {
        await this.restPost('/auth/logout', {})
      },

      getSession: async () => {
        try {
          const res = await this.restGet('/users/me')
          return res.data || res
        } catch {
          return null
        }
      },

      getProfile: async () => {
        try {
          const res = await this.restGet('/users/me')
          return res.data || res
        } catch {
          return null
        }
      },

      updateProfile: async (payload: Record<string, any>) => {
        const res = await this.restPatch('/users/me', { data: payload })
        return res.data || res
      },

      register: async (payload: Record<string, any>) => {
        const res = await this.restPost('/users', { data: payload })
        return res.data || res
      },
    },

    // Notifications namespace - implements NotifyAdapter interface
    notifications: {
      notify: async (payload: Record<string, any>) => {
        const userId = payload.userId || payload.recipientId
        if (!userId) return
        await this.content.createItem('notifications', {
          recipient: userId,
          content: payload.body || payload.title || 'Notification',
          type: payload.category || 'system',
          is_read: false,
          payload: payload.metadata || payload,
        })
      },

      dismiss: async (id: string) => {
        await this.restDelete(`/items/notifications/${id}`)
      },

      clear: async (userId: string) => {
        const items = await this.content.notifications.listNotifications({ userId })
        for (const item of items) {
          await this.restDelete(`/items/notifications/${item.id}`)
        }
      },

      listNotifications: async (args: Record<string, any> = {}) => {
        const userId = args.userId
        if (!userId) return []

        const notifications = await this.content.readItems('notifications', {
          filter: { recipient: { _eq: userId } },
          sort: args.sort || '-date_created',
          fields: args.fields || ['id', 'content', 'is_read', 'type', 'date_created', 'date_updated', 'payload'],
        })

        return (notifications as any[]).map((item) => ({
          id: String(item.id || ''),
          title: String((item.payload && item.payload.subject) || item.type || 'Notification'),
          body: String(item.content || ''),
          category: String(item.type || 'info'),
          read: Boolean(item.is_read),
          createdAt: item.date_created || new Date().toISOString(),
          source: 'directus',
          metadata: item.payload && typeof item.payload === 'object' ? item.payload : undefined,
        }))
      },

      getNotificationsSnapshot: async (args: Record<string, any> = {}) => {
        const notifications = await this.content.notifications.listNotifications(args)
        return {
          notifications,
          unreadCount: notifications.filter((n: { read: boolean }) => !n.read).length,
        }
      },

      markNotificationAsRead: async (id: string) => {
        await this.restPatch(`/items/notifications/${id}`, { data: { is_read: true } })
      },

      markAllNotificationsAsRead: async (args: Record<string, any> = {}) => {
        const userId = args.userId
        if (!userId) return
        const notifications = await this.content.notifications.listNotifications({ userId })
        const unread = notifications.filter((n: { read: boolean }) => !n.read)
        await Promise.all(
          unread.map((n: { id: string }) => this.restPatch(`/items/notifications/${n.id}`, { data: { is_read: true } }))
        )
      },
    },
  }

  private async graphqlRequest<T extends Record<string, any>>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      return await this.client.request<T>(query, variables)
    } catch (error: any) {
      // graphql-request throws on partial errors, but data may still be present
      const data = error?.response?.data || error?.data
      if (data && typeof data === 'object') {
        return data as T
      }
      throw error
    }
  }

  constructor(endpoint: string, token?: string) {
    this.endpoint = endpoint.replace(/\/$/, '')
    this.token = token
    this.client = new GraphQLClient(`${this.endpoint}/graphql`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  private normalizeFields(fields: any): any[] {
    if (!Array.isArray(fields)) return ['*']
    return fields.map((field) => {
      if (typeof field === 'string') {
        if (field.includes('.')) {
          return this.parseDotNotation(field)
        }
        return field
      }
      if (typeof field === 'object' && field !== null) {
        return Object.entries(field).map(([key, nested]) => ({
          [key]: this.normalizeFields(Array.isArray(nested) ? nested : [nested]),
        }))
      }
      return field
    })
  }

  private parseDotNotation(dotPath: string): AnyRecord {
    const parts = dotPath.split('.')
    if (parts.length <= 1) return { [dotPath]: ['*'] }

    // Skip leading wildcards to find the actual relation field
    const relationParts: string[] = []
    let foundRelation = false

    for (const part of parts) {
      if (part === '*' && !foundRelation) continue
      foundRelation = true
      relationParts.push(part)
    }

    if (relationParts.length === 0) return { '*': ['*'] }

    const relationName = relationParts[0] as string
    const remaining = relationParts.slice(1)

    // Any remaining parts after the relation means "expand deeply"
    if (remaining.length === 0 || remaining.every((p) => p === '*')) {
      return { [relationName]: ['*'] }
    }

    return { [relationName]: { [remaining.join('.')]: ['*'] } }
  }

  private async ensureSchema(collection: string) {
    if (this.schemaCache[collection]) return
    await this.fetchSchemaFields(collection)
  }

  private async fetchSchemaFields(typeName: string): Promise<void> {
    if (this.schemaCache[typeName]) return

    const query = `
      query IntrospectType {
        __type(name: "${typeName}") {
          fields {
            name
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
            args {
              name
              type {
                kind
                name
              }
            }
          }
        }
      }
    `

    try {
      const result = await this.graphqlRequest<Record<string, any>>(query)
      const fields: string[] = []
      const relations: Record<string, string> = {}

      for (const f of result?.__type?.fields || []) {
        const unwrapped = this.unwrapType(f.type)
        const kind = unwrapped?.kind
        const name = unwrapped?.name

        // Skip fields that require arguments (e.g. json functions)
        const hasRequiredArgs = (f.args || []).some((arg: AnyRecord) => {
          const argType = arg?.type
          const isRequired = argType?.kind === 'NON_NULL'
          return isRequired
        })
        if (hasRequiredArgs) continue

        if (kind === 'OBJECT') {
          relations[f.name] = name
        } else if (kind === 'SCALAR') {
          fields.push(f.name)
        }
      }

      this.schemaCache[typeName] = { fields, relations }
    } catch {
      this.schemaCache[typeName] = { fields: ['id'], relations: {} }
    }
  }

  private unwrapType(type: AnyRecord): AnyRecord | null {
    if (!type) return null
    if (type.kind !== 'NON_NULL' && type.kind !== 'LIST') return type
    return this.unwrapType(type.ofType)
  }

  private async buildSelectionSet(collection: string, fields: any[], depth = 0): Promise<string> {
    const schema = this.schemaCache[collection] || { fields: ['id'], relations: {} }
    const hasWildcard = fields.some((f) => typeof f === 'string' && f === '*')

    if (hasWildcard) {
      const base = schema.fields.length > 0 ? schema.fields : ['id']
      const nested = this.extractNestedFields(fields)
      const parts: string[] = [...base]

      // Expand relations when wildcard is used, but skip circular back-references
      const maxDepth = 2
      if (depth < maxDepth) {
        for (const [rel, relType] of Object.entries(schema.relations)) {
          if (nested[rel]) continue
          // Skip back-references to parent types to avoid circular queries
          if (relType.includes(collection) || collection.includes(relType)) continue
          await this.fetchSchemaFields(relType)
          const relFields = this.schemaCache[relType]?.fields || ['id']
          parts.push(`${rel} { ${relFields.join('\n')} }`)
        }
      }

      for (const [rel, relFields] of Object.entries(nested)) {
        const relType = schema.relations[rel]
        if (!relType) continue
        await this.fetchSchemaFields(relType)
        const relSelection = await this.buildSelectionSet(relType, relFields, depth + 1)
        if (relSelection) parts.push(`${rel} { ${relSelection} }`)
      }
      return parts.join('\n')
    }

    const parts: string[] = []
    for (const field of fields) {
      if (typeof field === 'string') {
        if (field) parts.push(field)
      } else if (typeof field === 'object' && field !== null) {
        for (const [key, nested] of Object.entries(field)) {
          const relType = schema.relations[key]
          if (!relType) continue
          await this.fetchSchemaFields(relType)
          const nestedFields = Array.isArray(nested) ? nested : [nested]
          const relSelection = await this.buildSelectionSet(relType, nestedFields, depth + 1)
          if (relSelection) parts.push(`${key} { ${relSelection} }`)
        }
      }
    }
    return parts.join('\n')
  }

  private extractNestedFields(fields: any[]): AnyRecord {
    const result: AnyRecord = {}
    for (const field of fields) {
      if (typeof field === 'object' && field !== null) {
        for (const [key, nested] of Object.entries(field)) {
          result[key] = Array.isArray(nested) ? nested : [nested]
        }
      }
    }
    return result
  }

  private escapeGraphQLString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
  }

  private buildGraphQLFilter(filter: Record<string, any>): string {
    const parts: string[] = []
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        parts.push(`${key}: { ${this.buildGraphQLFilter(value)} }`)
      } else if (Array.isArray(value)) {
        parts.push(`${key}: [${value.map((v) => JSON.stringify(v)).join(', ')}]`)
      } else {
        parts.push(`${key}: ${JSON.stringify(value)}`)
      }
    }
    return parts.join(', ')
  }

  private serializeFields(fields: any[]): string {
    const parts: string[] = []
    for (const field of fields) {
      if (typeof field === 'string') {
        if (field) parts.push(field)
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

  private async restPatch(path: string, body: any): Promise<any> {
    const url = new URL(`${this.endpoint}${path}`)
    const response = await fetch(url.toString(), {
      method: 'PATCH',
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

  private async restDelete(path: string): Promise<any> {
    const url = new URL(`${this.endpoint}${path}`)
    const response = await fetch(url.toString(), {
      method: 'DELETE',
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

  private normalizeResponse(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizeResponse(item))
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result: Record<string, any> = {}
      for (const [key, value] of Object.entries(data)) {
        if (key === 'directus_files_id' && value && typeof value === 'object') {
          result.file = this.normalizeResponse(value)
        } else {
          result[key] = this.normalizeResponse(value)
        }
      }
      return result
    }
    return data
  }
}

export type { Query }
