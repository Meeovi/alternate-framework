import type { TransportAdapter } from '@meeovi/types/dist/sdk/adapter'
import type { AuthAdapter } from '@meeovi/types/dist/auth/adapter'
import type { LoginInput, RegisterInput } from '@meeovi/types/dist/auth/inputs'
import type { Result } from '@meeovi/types/dist/core/result'
import type { AuthSession as Session } from '@meeovi/types/dist/auth/session'
import type { AuthUser as User } from '@meeovi/types/dist/auth/user'

import { unwrap } from './utils.js'

export const createAuthAdapter = (
  transport: TransportAdapter
): AuthAdapter => ({
  async getSession(): Promise<Session | null> {
    const res = await transport.request<Session>('GET', '/auth/session')
    if (res.error) return null
    return res.data as Session
  },

  async signIn(email: string, password: string): Promise<Session> {
    const res = await transport.request<Session>('POST', '/auth/login', {
      body: { email, password }
    })
    if (res.error) throw new Error(String(res.error))
    return res.data as Session
  },

  async signOut(): Promise<void> {
    await transport.request('POST', '/auth/logout')
    return
  }
})
