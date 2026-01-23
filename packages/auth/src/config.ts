
export interface AuthConfig {
  baseUrl: any
  authProvider: string
  authUrl?: string
  sessionCookieName?: string
}

let config: AuthConfig = {
  authProvider: 'better-auth',
  authUrl: '',
  sessionCookieName: 'session',
  baseUrl: undefined
}

export function setAuthConfig(newConfig: Partial<AuthConfig>) {
  config = { ...config, ...newConfig }
}

export function getAuthConfig(): AuthConfig {
  return config
}
