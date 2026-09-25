import { normalizeProduct } from './normalizers/product'
import { $fetch } from 'ofetch'

// Placeholder GraphQL document - replace with your actual generated types
const Starter_GetProductDocument = {
  loc: {
    source: {
      body: `query GetProduct($id: ID!) { product(id: $id) { id name } }`
    }
  }
}

export class StarterAdapter {
  private endpoint: string
  private token?: string

  public content = {
    // Content namespace
    getItem: async (collection: string, id: string | number, options: Record<string, any> = {}) => {
      const res = await $fetch(`${this.endpoint}/graphql`, {
        method: 'POST',
        body: {
          query: Starter_GetProductDocument.loc.source.body,
          variables: { id }
        },
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      return normalizeProduct(res.data.product)
    },

    // Search namespace - implements SearchAdapter interface
    search: async (query: string, options?: Record<string, any>) => {
      // Replace with actual search implementation
      return []
    },

    suggest: async (query: string) => {
      // Replace with actual suggest implementation
      return []
    },

    index: async (doc: Record<string, any>) => {
      // Replace with actual index implementation
    },

    stats: async () => {
      // Replace with actual stats implementation
      return {}
    },

    clear: async () => {
      // Replace with actual clear implementation
    },

    // Auth namespace - implements AuthAdapter interface
    auth: {
      login: async (payload: Record<string, any>) => {
        // Replace with actual login implementation
        return {}
      },

      logout: async () => {
        // Replace with actual logout implementation
      },

      getSession: async () => {
        // Replace with actual getSession implementation
        return null
      },

      getProfile: async () => {
        // Replace with actual getProfile implementation
        return null
      },

      updateProfile: async (payload: Record<string, any>) => {
        // Replace with actual updateProfile implementation
        return {}
      },

      register: async (payload: Record<string, any>) => {
        // Replace with actual register implementation
        return {}
      },
    },

    // Notifications namespace - implements NotifyAdapter interface
    notifications: {
      notify: async (payload: Record<string, any>) => {
        // Replace with actual notify implementation
      },

      dismiss: async (id: string) => {
        // Replace with actual dismiss implementation
      },

      clear: async () => {
        // Replace with actual clear implementation
      },

      listNotifications: async (args?: Record<string, any>) => {
        // Replace with actual listNotifications implementation
        return []
      },

      getNotificationsSnapshot: async (args?: Record<string, any>) => {
        // Replace with actual getNotificationsSnapshot implementation
        return { notifications: [], unreadCount: 0 }
      },

      markNotificationAsRead: async (id: string, args?: Record<string, any>) => {
        // Replace with actual markNotificationAsRead implementation
      },

      markAllNotificationsAsRead: async (args?: Record<string, any>) => {
        // Replace with actual markAllNotificationsAsRead implementation
      },
    },
  }

  constructor(endpoint: string, token?: string) {
    this.endpoint = endpoint.replace(/\/$/, '')
    this.token = token
  }
}

// Legacy helper - keep for backward compatibility
export async function getProduct(id: string) {
  const adapter = new StarterAdapter(
    process.env.ADAPTER_STARTER_ENDPOINT || '',
    process.env.ADAPTER_STARTER_TOKEN
  )
  return adapter.content.getItem('product', id)
}
