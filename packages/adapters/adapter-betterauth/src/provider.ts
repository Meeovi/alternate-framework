import * as BetterAuth from 'better-auth'
import { getAuthConfig } from './config.js'
import { getFrameworkContext } from './framework.js'

// Create a single shared Better Auth client instance
let client: any = null

function resolveClientFactory() {
  return (BetterAuth as any).Client ?? (BetterAuth as any).default ?? BetterAuth
}

function getClient() {
  if (client) return client

  const config = getAuthConfig()
  const ctx = getFrameworkContext()

  const Client = resolveClientFactory()
  client = Client({
    baseURL: config.baseUrl,
    fetch: async (url: string | Request | URL, options: RequestInit = {}) => {
      const baseHeaders = ctx.getRequestHeaders?.() || {}

      let optionHeaders: Record<string, string> = {}

      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          optionHeaders[key] = value
        })
      } else if (Array.isArray(options.headers)) {
        for (const [k, v] of options.headers) {
          optionHeaders[k] = v
        }
      } else if (typeof options.headers === 'object' && options.headers !== null) {
        optionHeaders = options.headers as Record<string, string>
      }

      const headers = {
        ...baseHeaders,
        ...optionHeaders
      }

      return fetch(url, { ...options, headers })
    }
  })

  return client
}

const BetterAuthProvider: any = {
  async login(credentials: any) {
    const client = getClient()
    const result = await client.signIn(credentials)

    if (result.error) {
      throw new Error(result.error.message || 'Login failed')
    }

    return result.data
  },

  async logout() {
    const client = getClient()
    await client.signOut()

    const ctx = getFrameworkContext()
    ctx.reloadApp?.()
  },

  async session() {
    const client = getClient()
    const result = await client.session()

    if (result.error) {
      return null
    }

    return result.data
  },

  async register(data: any) {
    const client = getClient()
    const result = await client.signUp(data)

    if (result.error) {
      throw new Error(result.error.message || 'Registration failed')
    }

    return result.data
  },

  async refresh() {
    const client = getClient()
    const result = await client.refresh()

    if (result.error) {
      throw new Error(result.error.message || 'Session refresh failed')
    }

    return result.data
  }
}

// Register the provider under the canonical name so other layers can discover
// it using the existing registry mechanism.
export default BetterAuthProvider
