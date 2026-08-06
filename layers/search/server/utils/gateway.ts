import { SearchAdapterRegistry } from 'alternate-sdk'
import type { SearchAdapter } from '../contracts/search'

/**
 * Server-side accessor for the default search adapter.
 *
 * During SSR, `initGateway()` (called from the `alternate-sdk` Nuxt module
 * via the `sdk.ts` plugin) resolves the search adapter and registers it as
 * the default via `setDefaultSearchAdapter()`. This helper gives server API
 * handlers a typed way to access it without importing from `alternate-sdk`
 * in frontend composables.
 */
export function getSearchDriver(): SearchAdapter {
  return SearchAdapterRegistry.getDefaultAdapter() ?? ({} as SearchAdapter)
}

/**
 * Server-side accessor for the default auth adapter.
 *
 * Set during `initGateway()` via `setDefaultAuthAdapter()`.
 */
export interface AuthAdapterWithMethods {
  login?: (payload: Record<string, any>) => Promise<any>
  logout?: () => Promise<void>
  getSession?: (...args: any[]) => Promise<any>
  getProfile?: (...args: any[]) => Promise<any>
  updateProfile?: (payload: Record<string, any>) => Promise<any>
  register?: (payload: Record<string, any>) => Promise<any>
  signUp?: (payload: Record<string, any>) => Promise<any>
  signIn?: (...args: any[]) => Promise<any>
  refresh?: (...args: any[]) => Promise<any>
  requestPasswordReset?: (...args: any[]) => Promise<any>
  confirmPasswordReset?: (...args: any[]) => Promise<any>
}

// eslint-disable-next-line no-restricted-imports
import { AuthAdapterRegistry } from 'alternate-sdk'

export function getAuthDriver(): AuthAdapterWithMethods {
  return (AuthAdapterRegistry.getDefaultAdapter() as AuthAdapterWithMethods) ?? ({} as AuthAdapterWithMethods)
}
