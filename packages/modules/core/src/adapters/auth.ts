import { BaseAdapterConfig } from './common'

export interface AuthAdapterConfig extends BaseAdapterConfig {
  provider: 'custom' | 'auth0' | 'cognito' | string
}

export interface AuthAdapter {
  login(payload: unknown): Promise<unknown>
  logout(): Promise<void>
  getSession(): Promise<unknown | null>
}