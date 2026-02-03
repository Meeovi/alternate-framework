import type { TransportAdapter, AuthAdapter, LoginInput, RegisterInput, Result, AuthSession as Session, AuthUser as User } from '@meeovi/core'

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
