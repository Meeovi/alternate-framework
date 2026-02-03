import type {
  AuthAdapter,
  TransportAdapter
} from '@meeovi/sdk'

import type {
  LoginInput,
  RegisterInput,
  Result,
  Session,
  User
} from '@meeovi/core'

import { unwrap } from './utils'

export const createAuthAdapter = (
  transport: TransportAdapter
): AuthAdapter => ({
  async login(input: LoginInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/login', {
      body: input
    })
    return unwrap(res)
  },

  async register(input: RegisterInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/register', {
      body: input
    })
    return unwrap(res)
  },

  async logout(): Promise<Result<true>> {
    const res = await transport.request('POST', '/auth/logout')
    return unwrap({ ...res, data: true })
  },

  async getSession(): Promise<Result<Session>> {
    const res = await transport.request<Session>('GET', '/auth/session')
    return unwrap(res)
  },

  async refresh(): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/auth/refresh')
    return unwrap(res)
  },

  async getUser(): Promise<Result<User>> {
    const res = await transport.request<User>('GET', '/auth/user')
    return unwrap(res)
  }
})
