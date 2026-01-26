import type {
  AuthAdapter,
  TransportAdapter
} from '@meeovi/sdk'

import type {
  LoginInput,
  RegisterInput,
  Result,
  AuthSession,
  User
} from '@meeovi/types'

import { unwrap } from './utils'

export const createStarterAuthAdapter = (
  transport: TransportAdapter
): AuthAdapter => ({
  async login(input: LoginInput): Promise<Result<AuthSession>> {
    const res = await transport.request<AuthSession>('POST', '/auth/login', {
      body: input
    })
    return unwrap(res)
  },

  async register(input: RegisterInput): Promise<Result<AuthSession>> {
    const res = await transport.request<AuthSession>('POST', '/auth/register', {
      body: input
    })
    return unwrap(res)
  },

  async logout(): Promise<Result<true>> {
    const res = await transport.request('POST', '/auth/logout')
    return unwrap({ ...res, data: true })
  },

  async getSession(): Promise<Result<AuthSession>> {
    const res = await transport.request<AuthSession>('GET', '/auth/session')
    return unwrap(res)
  },

  async refresh(): Promise<Result<AuthSession>> {
    const res = await transport.request<AuthSession>('POST', '/auth/refresh')
    return unwrap(res)
  },

  async getUser(): Promise<Result<User>> {
    const res = await transport.request<User>('GET', '/auth/user')
    return unwrap(res)
  }
})