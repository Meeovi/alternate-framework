import { readonly } from 'vue'
import type { Ref } from 'vue'
import type { AuthSession } from '../contracts/auth'
import { useAuth } from './useAuth'

/**
 * useSession()
 * Returns a readonly ref of the current AuthSession.
 * 
 * - SSR-safe
 * - Backend-agnostic
 * - Works with any AuthContract implementation
 */
export function useSession() {
  const { session } = useAuth()
  return readonly(session)
}
