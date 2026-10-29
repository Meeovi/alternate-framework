import { afterEach, describe, expect, it, vi } from 'vitest'
import { FEDERATION_REGISTRY, type FederationMemberSession, type FederationNetwork } from '../../shared/types/federation'

// The stored Bluesky session for each test user (atproto_sessions).
const stored = new Map<string, Record<string, string>>()
const saved: Array<{ userId: string, set: Record<string, unknown> }> = []

vi.mock('#auth/server/database/migrations/schema', () => ({ atprotoSessions: { userId: 'user_id' } }))
vi.mock('drizzle-orm', () => ({ eq: (_column: unknown, value: string) => value }))
vi.mock('#auth/server/utils/drizzle', () => ({
  db: {
    select: () => ({ from: () => ({ where: (userId: string) => ({ limit: async () => (stored.has(userId) ? [stored.get(userId)] : []) }) }) }),
    update: () => ({ set: (set: Record<string, unknown>) => ({ where: async (userId: string) => { saved.push({ userId, set }) } }) }),
  },
}))

const { memberCapabilities, memberSession, memberSessions, openMemberSession } = await import('../../server/utils/federation-members')

const g = globalThis as Record<symbol, unknown>
const account = (network: string) => ({ id: 'me', network, handle: 'me' })

function network(id: string, forMember?: FederationNetwork['forMember']): FederationNetwork {
  return { id, label: id.toUpperCase(), status: async () => ({ configured: true, connected: true, service: '' }), ...(forMember ? { forMember } : {}) }
}

function register(...networks: FederationNetwork[]) {
  g[FEDERATION_REGISTRY] = new Map(networks.map((n) => [n.id, n]))
}

afterEach(() => {
  delete g[FEDERATION_REGISTRY]
  stored.clear()
  saved.length = 0
})

describe('member sessions', () => {
  it('opens the site network for every member, with no credentials', async () => {
    const forMember = vi.fn(async (member) => ({ network: 'directus', account: account('directus'), lists: async () => [] }) as FederationMemberSession)
    register(network('directus', forMember))
    const session = await openMemberSession(network('directus', forMember), 'u1')
    expect(session?.network).toBe('directus')
    expect(forMember).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1', credentials: undefined }))
  })

  it('needs a stored Bluesky session before asking the atproto network', async () => {
    const forMember = vi.fn(async () => ({ network: 'atproto', account: account('atproto') }) as FederationMemberSession)
    const atproto = network('atproto', forMember)
    expect(await openMemberSession(atproto, 'u1')).toBeNull()
    expect(forMember).not.toHaveBeenCalled()

    stored.set('u1', { service: 'https://pds.test', did: 'did:plc:me', handle: 'me.test', accessJwt: 'a', refreshJwt: 'r' })
    await openMemberSession(atproto, 'u1')
    expect(forMember).toHaveBeenCalledWith(expect.objectContaining({
      id: 'u1',
      credentials: { service: 'https://pds.test', session: { did: 'did:plc:me', handle: 'me.test', accessJwt: 'a', refreshJwt: 'r' } },
    }))
  })

  it('saves refreshed Bluesky tokens for that member only', async () => {
    stored.set('u1', { service: 's', did: 'd', handle: 'h', accessJwt: 'a', refreshJwt: 'r' })
    let save: ((c: unknown) => Promise<void>) | undefined
    await openMemberSession(network('atproto', async (member) => { save = member.saveCredentials; return null }), 'u1')
    await save!({ session: { accessJwt: 'a2', refreshJwt: 'r2' } })
    expect(saved).toEqual([{ userId: 'u1', set: expect.objectContaining({ accessJwt: 'a2', refreshJwt: 'r2' }) }])
  })

  it('lists every network with whether the member is connected, and survives one failing', async () => {
    register(
      network('directus', async () => ({ network: 'directus', account: account('directus'), lists: async () => [] }) as FederationMemberSession),
      network('atproto', async () => null),
      network('activitypub'),
      network('broken', async () => { throw new Error('down') }),
    )
    const result = await memberSessions('u1')
    expect(result.map((n) => [n.id, n.connected])).toEqual([['directus', true], ['atproto', false], ['activitypub', false], ['broken', false]])
    expect(result.find((n) => n.id === 'broken')?.error).toMatch(/unavailable/)
  })

  it('asks the member to connect a network they have no session on', async () => {
    register(network('atproto', async () => null))
    await expect(memberSession('atproto', 'u1')).rejects.toMatchObject({ statusCode: 409, statusMessage: 'Connect your ATPROTO account first' })
    await expect(memberSession('nope', 'u1')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('reports what a session can do', () => {
    const session = { network: 'x', account: account('x'), lists: async () => [], like: async () => {} } as FederationMemberSession
    expect(memberCapabilities(session)).toEqual(['like', 'lists'])
    expect(memberCapabilities(null)).toEqual([])
  })
})
