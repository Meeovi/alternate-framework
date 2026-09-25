// packages/sdk/auth/adapter.ts

import { AuthAdapterRegistry } from '../contracts/auth.js'
import type { AuthAdapter as AuthAdapterContract } from '../contracts/auth.js'

export interface AuthAdapter {
  fetchSession?: (...args: any[]) => Promise<any>
  getSession?: (...args: any[]) => Promise<any>
  signIn?: (...args: any[]) => Promise<any>
  signOut?: (...args: any[]) => Promise<any>
  signUp?: (...args: any[]) => Promise<any>
  refresh?: (...args: any[]) => Promise<any>
  requestPasswordReset?: (...args: any[]) => Promise<any>
  confirmPasswordReset?: (...args: any[]) => Promise<any>
}

export function createAuthAdapter(
  runtimeAuth: Partial<AuthAdapter> = {},
  gatewayAuth: Partial<AuthAdapter> = {}
): AuthAdapter {
  const call = async (names: string[], ...args: any[]) => {
    for (const name of names) {
      const runtimeFn = (runtimeAuth as any)[name]
      const gatewayFn = (gatewayAuth as any)[name]
      if (typeof runtimeFn === 'function') return runtimeFn(...args)
      if (typeof gatewayFn === 'function') return gatewayFn(...args)
    }
    return null
  }

  return {
    fetchSession: (...args) => call(['fetchSession', 'getSession'], ...args),
    getSession: (...args) => call(['getSession', 'fetchSession'], ...args),
    signIn: (...args) => call(['signIn', 'login'], ...args),
    signOut: (...args) => call(['signOut', 'logout'], ...args),
    signUp: (...args) => call(['signUp', 'register'], ...args),
    refresh: (...args) => call(['refresh', 'refreshSession'], ...args),
    requestPasswordReset: (...args) => call(['requestPasswordReset', 'forgotPassword'], ...args),
    confirmPasswordReset: (...args) => call(['confirmPasswordReset', 'resetPassword'], ...args),
  }
}

function resolveGatewayAuth(): Record<string, any> {
  const runtime = globalThis as Record<string, any>
  const gatewayFactory = runtime.useGateway

  if (typeof gatewayFactory !== 'function') {
    return {}
  }

  try {
    const gateway = gatewayFactory() as Record<string, any>
    return (gateway?.auth as Record<string, any>) || {}
  } catch {
    return {}
  }
}

export function useAuthAdapter(): AuthAdapter {
  const registryAdapter = AuthAdapterRegistry.getDefaultAdapter() as AuthAdapterContract | undefined
  const gatewayAuth = resolveGatewayAuth()

  if (registryAdapter) {
    const merged = { ...registryAdapter, ...gatewayAuth }
    return merged as AuthAdapter
  }

  return createAuthAdapter({}, gatewayAuth)
}

export default useAuthAdapter
