import { BaseAdapterConfig } from './common'
import type { LoginInput, RegisterInput, Result, Session, User } from '../types'

export interface AuthAdapterConfig extends BaseAdapterConfig {
  provider: 'custom' | 'auth0' | 'cognito' | string
}

export interface AuthAdapter {
  login(input: LoginInput): Promise<Result<Session>>
  register?(input: RegisterInput): Promise<Result<Session>>
  logout(): Promise<Result<true>>
  getSession(): Promise<Result<Session | null>>
  refresh?(): Promise<Result<Session>>
  getUser?(): Promise<Result<User>>
}