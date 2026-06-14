import type { User } from './user.js'

export interface Session {
  user: User
  token?: string
  expires?: string
  expiresAt?: string | null
  [key: string]: any
}

export interface AuthContract {
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  getSession(): Promise<Session | null>
  refreshSession?(): Promise<Session | null>
}