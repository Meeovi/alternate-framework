// The social layer as a client over every federation network: a member's
// session on each network they're connected to (FederationNetwork.forMember).
// This file keeps what each network needs to act as the member — stored
// here, in the site's database — and hands it to the network plugin:
//
//   atproto   their AT Protocol session from Bluesky sign-in (atproto_sessions)
//   directus  nothing: every member has a session on this site's own network
//   activitypub  nothing yet: there's no Fediverse sign-in, so no session
//
// Routes use memberSession() for one network and memberSessions() for all.
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { atprotoSessions } from '#auth/server/database/migrations/schema'
import type {
  FederationMemberCapability,
  FederationMemberSession,
  FederationNetwork,
} from '../../shared/types/federation'
import { federationNetworks, useFederationNetwork, withNetworkTimeout } from './federation'

type CredentialStore = {
  load(userId: string): Promise<unknown | undefined>
  save(userId: string, credentials: unknown): Promise<void>
}

const CREDENTIALS: Record<string, CredentialStore> = {
  atproto: {
    async load(userId) {
      const [row] = await db.select().from(atprotoSessions).where(eq(atprotoSessions.userId, userId)).limit(1)
      if (!row) return undefined
      return { service: row.service, session: { did: row.did, handle: row.handle, accessJwt: row.accessJwt, refreshJwt: row.refreshJwt } }
    },
    async save(userId, credentials) {
      const session = (credentials as { session?: { accessJwt?: string, refreshJwt?: string } })?.session
      if (!session?.accessJwt || !session.refreshJwt) return
      await db.update(atprotoSessions)
        .set({ accessJwt: session.accessJwt, refreshJwt: session.refreshJwt, updatedAt: new Date() })
        .where(eq(atprotoSessions.userId, userId))
    },
  },
}

/** The member's session on one network, or null when they aren't connected to it. */
export async function openMemberSession(network: FederationNetwork, userId: string): Promise<FederationMemberSession | null> {
  if (typeof network.forMember !== 'function') return null
  const store = CREDENTIALS[network.id]
  const credentials = store ? await store.load(userId) : undefined
  if (store && credentials === undefined) return null
  return network.forMember({
    id: userId,
    credentials,
    saveCredentials: store ? (next) => store.save(userId, next) : undefined,
  })
}

/** The member's session on `networkId`, or a 404/409 h3 error. */
export async function memberSession(networkId: string, userId: string): Promise<FederationMemberSession> {
  const network = useFederationNetwork(networkId)
  const session = await openMemberSession(network, userId)
  if (!session) {
    throw createError({ statusCode: 409, statusMessage: `Connect your ${network.label} account first`, data: { network: network.id, connect: true } })
  }
  return session
}

export type MemberNetwork = {
  id: string
  label: string
  connected: boolean
  session: FederationMemberSession | null
  /** Why a connected network couldn't be opened (it timed out or failed). */
  error?: string
}

/** Every installed network with the member's session on it (null when
 *  they aren't connected). One network failing never fails the others. */
export async function memberSessions(userId: string): Promise<MemberNetwork[]> {
  return Promise.all(federationNetworks().map(async (network): Promise<MemberNetwork> => {
    try {
      const session = await withNetworkTimeout(openMemberSession(network, userId))
      return { id: network.id, label: network.label, connected: !!session, session }
    } catch (error: any) {
      console.error(`[federation:${network.id}] member session failed`, error?.message || error)
      return { id: network.id, label: network.label, connected: false, session: null, error: `${network.label} is unavailable right now` }
    }
  }))
}

const MEMBER_CAPABILITIES: FederationMemberCapability[] = [
  'timeline', 'publish', 'like', 'unlike', 'repost', 'unrepost', 'follow', 'unfollow',
  'lists', 'list', 'createList', 'updateList', 'deleteList', 'addToList', 'removeFromList',
]

/** What the member can do on a network, for the client to show. */
export function memberCapabilities(session: FederationMemberSession | null): FederationMemberCapability[] {
  return session ? MEMBER_CAPABILITIES.filter((c) => typeof session[c] === 'function') : []
}

/** The session method, or a 501 when this network can't do that. */
export function requireMemberCapability<C extends FederationMemberCapability>(session: FederationMemberSession, capability: C, label = session.network): NonNullable<FederationMemberSession[C]> {
  const fn = session[capability]
  if (typeof fn !== 'function') throw createError({ statusCode: 501, statusMessage: `${label} doesn't support that` })
  return (fn as Function).bind(session) as NonNullable<FederationMemberSession[C]>
}

/** A network/library error as a clean h3 error (keeps 4xx from the network). */
export function memberError(networkId: string, error: unknown): never {
  const e = error as { statusCode?: number, statusMessage?: string, message?: string }
  if (e?.statusCode && e?.statusMessage) throw createError({ statusCode: e.statusCode, statusMessage: e.statusMessage })
  console.error(`[federation:${networkId}]`, e?.message || error)
  throw createError({ statusCode: 502, statusMessage: 'That network is unavailable right now' })
}
