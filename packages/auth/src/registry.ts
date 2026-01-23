import type { AuthProvider } from './types'

const providers: Record<string, AuthProvider> = {}
let activeProvider: string | null = null

export function registerAuthProvider(name: string, provider: AuthProvider) {
  providers[name] = provider
}

export function setActiveAuthProvider(name: string) {
  if (!providers[name]) {
    throw new Error(`Auth provider "${name}" is not registered`)
  }
  activeProvider = name
}

export function getAuthProvider(): AuthProvider {
  if (!activeProvider) {
    throw new Error('No active auth provider has been set')
  }
  return providers[activeProvider]
}