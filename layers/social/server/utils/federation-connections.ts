// Members' connections to the networks they choose to link (Settings →
// Accounts): a Zot channel, a GNU social account, WebTorrent playback…
// One federation_connections row per member per network. What a network
// needs to act as the member (FederationNetwork.connection.connect's
// `credentials`) is stored AES-256-GCM encrypted and only decrypted here,
// to hand to the plugin (federation-members.ts). Plugins never touch the
// database.
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { federationConnections } from '#auth/server/database/migrations/schema'

const VERSION = 'v1'

let cachedKey: Buffer | null = null
function key(): Buffer {
  if (cachedKey) return cachedKey
  const secret = process.env.FEDERATION_CREDENTIALS_KEY || process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('FEDERATION_CREDENTIALS_KEY (or BETTER_AUTH_SECRET) is required to store network credentials')
  cachedKey = Buffer.from(hkdfSync('sha256', secret, 'meeovi', 'federation-connections/v1', 32))
  return cachedKey
}

/** Credentials → 'v1.<iv>.<tag>.<ciphertext>' (base64url). */
export function sealCredentials(value: unknown): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()])
  return [VERSION, iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), body.toString('base64url')].join('.')
}

/** The stored string back to credentials; undefined when it can't be read (key changed, tampered). */
export function openCredentials(sealed: string | null | undefined): unknown {
  if (!sealed) return undefined
  const [version, iv, tag, body] = sealed.split('.')
  if (version !== VERSION || !iv || !tag || !body) return undefined
  try {
    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8'))
  } catch {
    return undefined
  }
}

export type MemberConnection = {
  network: string
  account: string | null
  service: string | null
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const publicRow = (row: typeof federationConnections.$inferSelect): MemberConnection => ({
  network: row.network,
  account: row.account,
  service: row.service,
  settings: (row.settings ?? {}) as Record<string, unknown>,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

/** The member's connections (never their credentials). */
export async function listConnections(userId: string): Promise<MemberConnection[]> {
  const rows = await db.select().from(federationConnections).where(eq(federationConnections.userId, userId))
  return rows.map(publicRow)
}

export async function findConnection(userId: string, network: string): Promise<(MemberConnection & { credentials: unknown }) | null> {
  const [row] = await db.select().from(federationConnections)
    .where(and(eq(federationConnections.userId, userId), eq(federationConnections.network, network))).limit(1)
  return row ? { ...publicRow(row), credentials: openCredentials(row.credentials) } : null
}

export async function saveConnection(userId: string, network: string, value: { account?: string | null, service?: string | null, credentials?: unknown, settings?: Record<string, unknown> }): Promise<void> {
  const now = new Date()
  const row = {
    account: value.account ?? null,
    service: value.service ?? null,
    credentials: value.credentials === undefined ? null : sealCredentials(value.credentials),
    settings: value.settings ?? {},
    updatedAt: now,
  }
  await db.insert(federationConnections).values({ userId, network, ...row, createdAt: now })
    .onConflictDoUpdate({ target: [federationConnections.userId, federationConnections.network], set: row })
}

/** Replaces only the stored credentials (a network refreshed its token). */
export async function updateConnectionCredentials(userId: string, network: string, credentials: unknown): Promise<void> {
  await db.update(federationConnections).set({ credentials: sealCredentials(credentials), updatedAt: new Date() })
    .where(and(eq(federationConnections.userId, userId), eq(federationConnections.network, network)))
}

export async function removeConnection(userId: string, network: string): Promise<boolean> {
  const rows = await db.delete(federationConnections)
    .where(and(eq(federationConnections.userId, userId), eq(federationConnections.network, network)))
    .returning({ network: federationConnections.network })
  return rows.length > 0
}
