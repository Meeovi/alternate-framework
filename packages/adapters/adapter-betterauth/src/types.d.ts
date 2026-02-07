// Re-export the canonical SDK/core types so consumers of this adapter can import
// from the adapter package and still get accurate types from the source
// modules.
export type { TransportAdapter, AuthAdapter, CommerceAdapter, SearchAdapter } from '@mframework/sdk'
export type { LoginInput, RegisterInput, Result, Session, User } from '@mframework/core'

// Re-export prisma utilities from the api package for convenience.
export { prisma, useDB, isValidTable } from '@mframework/api'

// Adapter exports
export function getAuthPlugins(opts?: any): any[]
export const BetterAuthProvider: any
export default BetterAuthProvider

// Re-export the concrete types from the source `types.ts` so the package's
// declared `.d.ts` entry exposes `AuthProvider` and related interfaces to
// consumers importing from the package root.
export type { AuthProvider, AuthCredentials, AuthRegistration, AuthSession } from './types'
