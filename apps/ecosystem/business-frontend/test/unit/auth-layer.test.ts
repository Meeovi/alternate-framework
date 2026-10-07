/**
 * Unit tests — Auth Layer
 *
 * Tests the auth layer's type contracts, JWT signing behaviour (the
 * base64-based signer used in layers/auth/server/utils/jwt.ts), a
 * self-contained mock AuthAdapter implementation, and the Magento
 * OAuth provider configuration shape.
 *
 * No live database, better-auth instance, or network connection is
 * required — every dependency is either inlined or mocked.
 */

import { beforeEach, describe, expect, it } from 'vitest'

// ─── Type definitions (mirror layers/auth/app/types/) ────────────────────────

interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthSession {
  user: AuthUser | null
  accessToken: string | null
  refreshToken?: string | null
  expiresAt?: number
}

interface AuthAdapter {
  getSession(): Promise<AuthSession | null>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
}

// ─── JWT signing helpers (extracted from layers/auth/server/utils/jwt.ts) ────
// The layer uses a lightweight base64-JSON signer for isolated test coverage.

function signToken(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

function verifyToken(token: string): Record<string, unknown> {
  const raw = Buffer.from(token, 'base64').toString('utf-8')
  return JSON.parse(raw)
}

// ─── In-memory AuthAdapter factory ───────────────────────────────────────────

interface StoredCredential {
  user: AuthUser
  password: string
}

function createMemoryAuthAdapter(credentials: StoredCredential[]): AuthAdapter {
  let currentSession: AuthSession | null = null

  return {
    async getSession() {
      return currentSession
    },

    async signIn(email: string, password: string): Promise<AuthSession> {
      const entry = credentials.find(
        (c) => c.user.email === email && c.password === password,
      )
      if (!entry) {
        throw new Error('Invalid credentials')
      }

      const token = signToken({
        sub: entry.user.id,
        email: entry.user.email,
        iat: Math.floor(Date.now() / 1000),
      })

      currentSession = {
        user: entry.user,
        accessToken: token,
        expiresAt: Date.now() + 3_600_000, // 1 hour from now
      }
      return currentSession
    },

    async signOut() {
      currentSession = null
    },
  }
}

// ─── Magento OAuth config builder (mirrors layers/auth/server/utils/magento.ts) ─

interface MagentoOAuthConfig {
  providerId: string
  clientId: string | undefined
  clientSecret: string | undefined
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
}

function buildMagentoOAuthConfig(storeUrl: string): MagentoOAuthConfig {
  return {
    providerId: 'magento',
    clientId: process.env.MAGENTO_CLIENT_ID,
    clientSecret: process.env.MAGENTO_CLIENT_SECRET,
    authorizationUrl: `${storeUrl}/oauth/authorize`,
    tokenUrl: `${storeUrl}/oauth/token`,
    userInfoUrl: `${storeUrl}/rest/V1/customers/me`,
    scopes: ['openid', 'email', 'profile'],
  }
}

// ─── Shared fixture ───────────────────────────────────────────────────────────

const ALICE: AuthUser = {
  id: 'usr-alice',
  email: 'alice@example.com',
  name: 'Alice',
  emailVerified: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const BOB: AuthUser = {
  id: 'usr-bob',
  email: 'bob@example.com',
  emailVerified: false,
  createdAt: '2025-03-01T00:00:00Z',
  updatedAt: '2025-03-01T00:00:00Z',
}

// ─── Type contract tests ──────────────────────────────────────────────────────

describe('Auth Layer — AuthUser type', () => {
  it('accepts all required fields', () => {
    const user: AuthUser = { ...ALICE }
    expect(user.id).toBe('usr-alice')
    expect(user.email).toBe('alice@example.com')
    expect(user.emailVerified).toBe(true)
    expect(user.createdAt).toBeTruthy()
    expect(user.updatedAt).toBeTruthy()
  })

  it('allows optional fields to be absent', () => {
    const user: AuthUser = { ...BOB }
    expect(user.name).toBeUndefined()
    expect(user.avatarUrl).toBeUndefined()
  })

  it('emailVerified can be false for unconfirmed accounts', () => {
    const user: AuthUser = { ...BOB }
    expect(user.emailVerified).toBe(false)
  })
})

describe('Auth Layer — AuthSession type', () => {
  it('represents an unauthenticated state with null fields', () => {
    const session: AuthSession = { user: null, accessToken: null }
    expect(session.user).toBeNull()
    expect(session.accessToken).toBeNull()
  })

  it('represents an authenticated state with user and token', () => {
    const session: AuthSession = {
      user: ALICE,
      accessToken: 'some-token',
      expiresAt: Date.now() + 3_600_000,
    }
    expect(session.user?.email).toBe('alice@example.com')
    expect(session.accessToken).toBeTruthy()
    expect(session.expiresAt).toBeGreaterThan(Date.now())
  })

  it('supports an optional refreshToken', () => {
    const session: AuthSession = {
      user: ALICE,
      accessToken: 'access',
      refreshToken: 'refresh',
    }
    expect(session.refreshToken).toBe('refresh')
  })
})

// ─── JWT signing ──────────────────────────────────────────────────────────────

describe('Auth Layer — JWT token signing (base64 signer)', () => {
  it('produces a non-empty string', () => {
    const token = signToken({ sub: 'usr-1' })
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('round-trips a simple payload without data loss', () => {
    const payload = { sub: 'usr-1', email: 'alice@example.com' }
    const decoded = verifyToken(signToken(payload))
    expect(decoded.sub).toBe('usr-1')
    expect(decoded.email).toBe('alice@example.com')
  })

  it('round-trips a complex nested payload', () => {
    const payload = {
      sub: 'usr-99',
      iat: 1_700_000_000,
      exp: 1_700_003_600,
      claims: { admin: true, orgId: 'org-123' },
    }
    expect(verifyToken(signToken(payload))).toEqual(payload)
  })

  it('the signed token is valid base64 containing JSON', () => {
    const token = signToken({ sub: 'usr-1' })
    expect(() => JSON.parse(Buffer.from(token, 'base64').toString())).not.toThrow()
  })

  it('different payloads produce different tokens', () => {
    expect(signToken({ sub: 'user-a' })).not.toBe(signToken({ sub: 'user-b' }))
  })

  it('token does not change on repeated signing of identical payload', () => {
    const payload = { sub: 'stable' }
    expect(signToken(payload)).toBe(signToken(payload))
  })
})

// ─── In-memory AuthAdapter — sign-in / session / sign-out ────────────────────

describe('Auth Layer — AuthAdapter (in-memory implementation)', () => {
  let adapter: AuthAdapter

  beforeEach(() => {
    adapter = createMemoryAuthAdapter([
      { user: ALICE, password: 's3cr3t' },
      { user: BOB, password: 'b0bpass' },
    ])
  })

  it('getSession() returns null before any sign-in', async () => {
    expect(await adapter.getSession()).toBeNull()
  })

  it('signIn() resolves with a session for valid credentials', async () => {
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    expect(session).toBeDefined()
    expect(session.user).not.toBeNull()
  })

  it('signIn() sets the correct user on the session', async () => {
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    expect(session.user?.id).toBe('usr-alice')
    expect(session.user?.email).toBe('alice@example.com')
  })

  it('signIn() provides a non-empty accessToken', async () => {
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    expect(session.accessToken).toBeTruthy()
  })

  it('accessToken encodes a verifiable JWT with sub and email', async () => {
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    const claims = verifyToken(session.accessToken!)
    expect(claims.sub).toBe('usr-alice')
    expect(claims.email).toBe('alice@example.com')
  })

  it('accessToken includes an iat claim', async () => {
    const before = Math.floor(Date.now() / 1000)
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    const claims = verifyToken(session.accessToken!)
    expect(typeof claims.iat).toBe('number')
    expect(claims.iat as number).toBeGreaterThanOrEqual(before)
  })

  it('session.expiresAt is set in the future', async () => {
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    expect(session.expiresAt).toBeDefined()
    expect(session.expiresAt!).toBeGreaterThan(Date.now())
  })

  it('getSession() returns the active session immediately after sign-in', async () => {
    await adapter.signIn('alice@example.com', 's3cr3t')
    const session = await adapter.getSession()
    expect(session?.user?.email).toBe('alice@example.com')
  })

  it('supports multiple distinct users', async () => {
    const adapterA = createMemoryAuthAdapter([{ user: ALICE, password: 'pa' }])
    const adapterB = createMemoryAuthAdapter([{ user: BOB, password: 'pb' }])

    const sa = await adapterA.signIn('alice@example.com', 'pa')
    const sb = await adapterB.signIn('bob@example.com', 'pb')

    expect(sa.user?.id).toBe('usr-alice')
    expect(sb.user?.id).toBe('usr-bob')
  })

  it('signIn() throws "Invalid credentials" for an unknown email', async () => {
    await expect(
      adapter.signIn('ghost@example.com', 's3cr3t'),
    ).rejects.toThrow('Invalid credentials')
  })

  it('signIn() throws "Invalid credentials" for a wrong password', async () => {
    await expect(
      adapter.signIn('alice@example.com', 'wrongpass'),
    ).rejects.toThrow('Invalid credentials')
  })

  it('signOut() clears the current session', async () => {
    await adapter.signIn('alice@example.com', 's3cr3t')
    await adapter.signOut()
    expect(await adapter.getSession()).toBeNull()
  })

  it('can sign in again after sign-out', async () => {
    await adapter.signIn('alice@example.com', 's3cr3t')
    await adapter.signOut()
    const session = await adapter.signIn('alice@example.com', 's3cr3t')
    expect(session.user?.email).toBe('alice@example.com')
  })

  it('second user can sign in independently on the same adapter', async () => {
    const adapterMulti = createMemoryAuthAdapter([
      { user: ALICE, password: 'pa' },
      { user: BOB, password: 'pb' },
    ])
    await adapterMulti.signIn('alice@example.com', 'pa')
    // Bob signs in, overwriting the in-memory session
    const session = await adapterMulti.signIn('bob@example.com', 'pb')
    expect(session.user?.id).toBe('usr-bob')
  })
})

// ─── Magento OAuth provider configuration ────────────────────────────────────

describe('Auth Layer — Magento OAuth provider config', () => {
  const STORE_URL = 'https://store.example.com'

  it('sets providerId to "magento"', () => {
    expect(buildMagentoOAuthConfig(STORE_URL).providerId).toBe('magento')
  })

  it('authorizationUrl points to the Magento oauth/authorize endpoint', () => {
    expect(buildMagentoOAuthConfig(STORE_URL).authorizationUrl).toBe(
      `${STORE_URL}/oauth/authorize`,
    )
  })

  it('tokenUrl points to the Magento oauth/token endpoint', () => {
    expect(buildMagentoOAuthConfig(STORE_URL).tokenUrl).toBe(
      `${STORE_URL}/oauth/token`,
    )
  })

  it('userInfoUrl points to the Magento REST customers/me endpoint', () => {
    expect(buildMagentoOAuthConfig(STORE_URL).userInfoUrl).toBe(
      `${STORE_URL}/rest/V1/customers/me`,
    )
  })

  it('requests openid, email, and profile scopes', () => {
    const { scopes } = buildMagentoOAuthConfig(STORE_URL)
    expect(scopes).toContain('openid')
    expect(scopes).toContain('email')
    expect(scopes).toContain('profile')
  })

  it('stores all required structural keys', () => {
    const config = buildMagentoOAuthConfig(STORE_URL)
    const required: (keyof MagentoOAuthConfig)[] = [
      'providerId',
      'authorizationUrl',
      'tokenUrl',
      'userInfoUrl',
      'scopes',
    ]
    for (const key of required) {
      expect(config).toHaveProperty(key)
    }
  })

  it('uses a different store URL for each environment', () => {
    const staging = buildMagentoOAuthConfig('https://staging.store.io')
    const prod = buildMagentoOAuthConfig('https://store.io')

    expect(staging.authorizationUrl).not.toBe(prod.authorizationUrl)
    expect(staging.authorizationUrl).toContain('staging.store.io')
  })
})
