
export interface AuthSession {
  user: {
    id: string
    email?: string
    name?: string
    avatarUrl?: string
    [key: string]: any
  }
  expiresAt?: string
  [key: string]: any
}

export interface AuthCredentials {
  email: string
  password: string
  [key: string]: any
}

export interface AuthRegistration {
  email: string
  password: string
  name?: string
  [key: string]: any
}

export interface AuthProvider {
  login(credentials: AuthCredentials): Promise<AuthSession>
  logout(): Promise<void>
  session(): Promise<AuthSession | null>
  register?(data: AuthRegistration): Promise<AuthSession>
  refresh?(): Promise<AuthSession>
}