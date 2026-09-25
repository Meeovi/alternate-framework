// Runtime server utilities for authentication
import { useAuthAdapter } from './adapter.js'
import { AuthAdapterRegistry } from '../contracts/auth.js'

type AnyRecord = Record<string, any>

export async function getServerAuth(event?: any): Promise<AnyRecord | null> {
  try {
    const registryAdapter = AuthAdapterRegistry.getDefaultAdapter()
    if (registryAdapter) {
      const session = await registryAdapter.getSession?.(event)
      return session || null
    }

    const adapter = useAuthAdapter()
    if (adapter) {
      const session = await adapter.getSession?.(event)
      return session || null
    }

    const runtime = globalThis as AnyRecord
    const authFactory = runtime.getAuth as any

    if (typeof authFactory === 'function') {
      return await authFactory(event)
    }

    return null
  } catch {
    return null
  }
}

export function useAuth(): AnyRecord {
  const adapter = useAuthAdapter()

  return {
    login: (payload: AnyRecord) => adapter?.signIn?.(payload),
    logout: () => adapter?.signOut?.(),
    getSession: () => adapter?.getSession?.(),
    getProfile: () => Promise.resolve(null),
    updateProfile: (payload: AnyRecord) => Promise.resolve(null),
    register: (payload: AnyRecord) => adapter?.signUp?.(payload),
    getAdapter: () => adapter,
  }
}
