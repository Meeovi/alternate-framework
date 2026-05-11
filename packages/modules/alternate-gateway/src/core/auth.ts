import type { User } from './user'

export interface AuthSession {
  user: User | null
  accessToken?: string
  refreshToken?: string
  expiresAt?: string | null
  [key: string]: unknown
}

export interface AuthCredentials {
  email: string
  password: string
  [key: string]: unknown
}

export interface AuthContract {
  getSession(): Promise<AuthSession | null>
  login(credentials: AuthCredentials): Promise<AuthSession>
  logout(): Promise<void>
  refresh?(): Promise<AuthSession | null>
}
