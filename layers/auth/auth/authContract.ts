import { createAuthClient } from 'better-auth/client'
import type { AuthContract, AuthCredentials, AuthSession, User } from '@mframework/core'

function createClient() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  return {
    headers,
    client: createAuthClient({
      baseURL: url.origin,
      fetchOptions: {
        headers,
      },
    }),
  }
}

function normalizeUser(user: any): User | null {
  if (!user)
    return null

  return {
    ...user,
    id: String(user.id || ''),
    email: String(user.email || ''),
    name: user.name || user.username || undefined,
    roles: Array.isArray(user.roles) ? user.roles.map((role: unknown) => String(role)) : user.role ? [String(user.role)] : undefined,
    avatarUrl: user.image || user.avatarUrl || user.avatar || undefined,
  }
}

function normalizeSession(payload: any): AuthSession | null {
  if (!payload)
    return null

  const session = payload.session || payload
  const user = normalizeUser(payload.user || session?.user)

  return {
    ...session,
    user,
    accessToken: payload.accessToken || session?.accessToken || undefined,
    refreshToken: payload.refreshToken || session?.refreshToken || undefined,
    expiresAt: payload.expiresAt || session?.expiresAt || null,
  }
}

async function getSession() {
  const { client, headers } = createClient()
  const { data } = await client.getSession({
    fetchOptions: {
      headers,
    },
  })

  return normalizeSession(data)
}

const authContract: AuthContract = {
  async getSession() {
    return await getSession()
  },
  async login(credentials: AuthCredentials) {
    const { client } = createClient()
    const response = await (client.signIn as any).email({
      email: credentials.email,
      password: credentials.password,
      ...credentials,
    })

    if (response?.error)
      throw new Error(String(response.error.message || 'Unable to sign in'))

    const session = await getSession()
    if (!session)
      throw new Error('Unable to resolve session after sign in')

    return session
  },
  async logout() {
    const { client } = createClient()
    await client.signOut()
  },
  async refresh() {
    return await getSession()
  },
}

export default authContract
