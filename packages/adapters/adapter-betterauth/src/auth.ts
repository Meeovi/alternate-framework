import type {
  AuthAdapter,
  TransportAdapter
} from '@mframework/sdk'

import type {
  LoginInput,
  RegisterInput,
  Result,
  Session,
  User
} from '@mframework/core'

import { unwrap } from './utils'

export const createAuthAdapter = (
  transport: TransportAdapter
): AuthAdapter => ({
  async login(input: LoginInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/login', {
      body: input
    })
    return unwrap(res)
  },

  async register(input: RegisterInput): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/register', {
      body: input
    })
    return unwrap(res)
  },

  async logout(): Promise<Result<true>> {
    const res = await transport.request('POST', '/logout')
    return unwrap({ ...res, data: true })
  },

  async getSession(): Promise<Result<Session>> {
    const res = await transport.request<Session>('GET', '/session')
    return unwrap(res)
  },

  async refresh(): Promise<Result<Session>> {
    const res = await transport.request<Session>('POST', '/refresh')
    return unwrap(res)
  },

  async getUser(): Promise<Result<User>> {
    const res = await transport.request<User>('GET', '/user')
    return unwrap(res)
  }
})