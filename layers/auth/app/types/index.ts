import type { UserWithTwoFactor } from 'better-auth/plugins/two-factor'
import type { Passkey } from '@better-auth/passkey'

// ============================
// App-specific types
// ============================

export interface User {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  stripeCustomerId?: string
  metadata?: {
    referralSource?: string | null
    [key: string]: any
  }
  [key: string]: any
}

// Re-export better-auth types we depend on
export type { UserWithTwoFactor }

// ============================
// Core Auth Types
// ============================

/** Better-auth user shape as returned by getSession / useSession */
export interface BetterAuthUser {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  image?: string | null
  createdAt?: string
  updatedAt?: string
  twoFactorEnabled?: boolean
  role?: string
  [key: string]: any
}

/** Better-auth session shape */
export interface BetterAuthSession {
  user: BetterAuthUser | null
  session: {
    id: string
    createdAt: string
    updatedAt: string
    userId: string
    expiresAt: string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
    activeOrganizationId?: string | null
    activeTeamId?: string | null
  } | null
  [key: string]: any
}

/** Shape returned by authClient.useSession() / getSession() */
export interface AuthSessionResult {
  data: BetterAuthSession | null
  error: { message?: string; status?: number } | null
  isPending: boolean
}

// ============================
// Passkey Types
// ============================

/** Passkey as returned by better-auth passkey plugin */
export type BetterAuthPasskey = Passkey & {
  id: string
  name?: string
  userId: string
  publicKey: string
  credentialID: string
  counter: number
  deviceType: string
  backedUp: boolean
  transports?: string
  createdAt: Date
  aaguid?: string
}

/** Response from passkey list/add/delete operations */
export interface PasskeyResponse {
  data: BetterAuthPasskey[] | null
  error: { message?: string; code?: string; status?: number } | null
}

// ============================
// Two-Factor Types
// ============================

/** Enable 2FA response */
export interface TwoFactorEnableResponse {
  data?: {
    backupCodes: string[]
    totpURI?: string
  }
  error: { message?: string; code?: string } | null
}

/** Verify TOTP response */
export interface TwoFactorVerifyResponse {
  data?: {
    session: BetterAuthSession
  }
  error: { message?: string; code?: string } | null
}

/** 2FA error codes */
export interface TwoFactorError {
  message?: string
  code?:
    | 'OTP_NOT_ENABLED'
    | 'TOTP_NOT_ENABLED'
    | 'TWO_FACTOR_NOT_ENABLED'
    | 'BACKUP_CODES_NOT_ENABLED'
    | 'INVALID_BACKUP_CODE'
    | 'INVALID_CODE'
    | 'TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE'
    | 'ACCOUNT_TEMPORARILY_LOCKED'
    | 'INVALID_TWO_FACTOR_COOKIE'
}

// ============================
// Device Authorization Types
// ============================

/** Device code request response */
export interface DeviceCodeResponse {
  data?: {
    device_code: string
    user_code: string
    verification_uri: string
    verification_uri_complete?: string
    expires_in: number
    interval: number
  }
  error: {
    error: 'invalid_request' | 'invalid_client'
    error_description: string
    status: number
    statusText: string
  } | null
}

/** Device token response */
export interface DeviceTokenResponse {
  data?: {
    access_token: string
    refresh_token?: string
    token_type: string
    expires_in?: number
    scope?: string
  }
  error: {
    error:
      | 'invalid_request'
      | 'invalid_grant'
      | 'unauthorized_client'
      | 'unsupported_grant_type'
      | 'invalid_scope'
    error_description: string
    status: number
    statusText: string
  } | null
}

/** Device verify/approve/deny response */
export interface DeviceActionResponse {
  data?: {
    client?: {
      id: string
      name?: string
    }
    request?: {
      id: string
      userId?: string
      scope?: string
    }
  }
  error: {
    error:
      | 'invalid_request'
      | 'expired_token'
      | 'access_denied'
      | 'device_code_already_processed'
      | 'unauthorized'
    error_description: string
    status: number
    statusText: string
  } | null
}

// ============================
// Organization Types
// ============================

/** Organization as returned by better-auth */
export interface BetterAuthOrganization {
  id: string
  name: string
  slug: string
  createdAt?: string
  logo?: string | null
  userId?: string
  metadata?: Record<string, any>
  [key: string]: any
}

/** Organization member */
export interface BetterAuthMember {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt?: string
  user?: {
    id: string
    name?: string
    email?: string
    image?: string | null
  }
  [key: string]: any
}

/** Organization team */
export interface BetterAuthTeam {
  id: string
  name: string
  organizationId: string
  createdAt?: string
  [key: string]: any
}

/** Organization invitation */
export interface BetterAuthInvitation {
  id: string
  email: string
  organizationId: string
  role: string
  status: 'pending' | 'accepted' | 'rejected' | 'canceled'
  expiresAt?: string
  inviterId?: string
  [key: string]: any
}

/** Organization role */
export interface BetterAuthRole {
  id: string
  name: string
  description?: string
  organizationId?: string
  permissions?: Record<string, any>
  [key: string]: any
}

// ============================
// Multi-Session Types
// ============================

/** Device session as returned by multiSession plugin */
export interface BetterAuthDeviceSession {
  id: string
  sessionToken: string
  userId: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
  expiresAt: string
  user?: {
    id: string
    email: string
    name?: string
    image?: string | null
  }
  [key: string]: any
}

// ============================
// Component-facing type aliases
// (used in templates and composables)
// ============================

export type SessionData = BetterAuthSession | null
export type OrganizationData = BetterAuthOrganization[]
export type PasskeyData = BetterAuthPasskey[]
export type DeviceSessionData = BetterAuthDeviceSession[]
export type MemberData = BetterAuthMember[]
export type TeamData = BetterAuthTeam[]
export type InvitationData = BetterAuthInvitation[]
export type RoleData = BetterAuthRole[]
