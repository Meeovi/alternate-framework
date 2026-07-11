import type { User } from './user.js'

export interface Session {
  user: User
  token?: string
  expires?: string
  expiresAt?: string | null
  [key: string]: any
}

export interface AuthAdapterLoginPayload {
  email: string
  password: string
}

export interface AuthAdapterRegisterPayload {
  [key: string]: any
}

export interface AuthAdapterUpdateProfilePayload {
  [key: string]: any
}

export interface AuthContract {
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  getSession(): Promise<Session | null>
  refreshSession?(): Promise<Session | null>
  clear(): Promise<void>
  getAdapter(): () => AuthAdapter
}

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

export interface AuthAdapterWithMethods {
  login(payload: AuthAdapterLoginPayload): Promise<any>
  logout(): Promise<void>
  getSession(): Promise<any>
  getProfile(): Promise<any>
  updateProfile(payload: AuthAdapterUpdateProfilePayload): Promise<any>
  register(payload: AuthAdapterRegisterPayload): Promise<any>
}

const authRegistry = new Map<string, AuthAdapter | AuthAdapterWithMethods>()
let defaultAuthAdapter: (AuthAdapter | AuthAdapterWithMethods) | undefined

export function registerAuthAdapter(name: string, adapter: AuthAdapter | AuthAdapterWithMethods): void {
  authRegistry.set(name, adapter)
}

export function getAuthAdapter(name?: string): (AuthAdapter | AuthAdapterWithMethods) | undefined {
  if (name) return authRegistry.get(name)
  return defaultAuthAdapter
}

export function setDefaultAuthAdapter(adapter: AuthAdapter | AuthAdapterWithMethods): void {
  defaultAuthAdapter = adapter
}

export const AuthAdapterRegistry = {
  register: registerAuthAdapter,
  get: getAuthAdapter,
  getDefaultAdapter: () => defaultAuthAdapter,
  setDefaultAdapter: setDefaultAuthAdapter,
}
