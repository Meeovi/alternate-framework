import { afterEach, describe, expect, it } from 'vitest'
import {
  federationCapabilities,
  federationError,
  federationNetworks,
  registerFederationNetwork,
  requireCapability,
  useFederationNetwork,
} from '../../server/utils/federation'
import { FEDERATION_REGISTRY, type FederationNetwork } from '../../shared/types/federation'
import { extractFederationAttachments } from '../../shared/federation/attachments'
import { createModerationEvent, toActivityPubFlag } from '../../shared/federation/moderation'
import { decodeSyncCursor, encodeSyncCursor, mergeProtocolTimelines } from '../../shared/federation/timeline'

const g = globalThis as Record<symbol, unknown>

function fakeNetwork(id: string, extra: Partial<FederationNetwork> = {}): FederationNetwork {
  return {
    id,
    label: id.toUpperCase(),
    status: async () => ({ configured: true, connected: true, service: `https://${id}.test` }),
    ...extra,
  }
}

describe('federation registry', () => {
  afterEach(() => { delete g[FEDERATION_REGISTRY] })

  it('starts empty and lists networks in registration order', () => {
    expect(federationNetworks()).toEqual([])
    registerFederationNetwork(fakeNetwork('atproto'))
    registerFederationNetwork(fakeNetwork('activitypub'))
    expect(federationNetworks().map((n) => n.id)).toEqual(['atproto', 'activitypub'])
  })

  it('sees networks a plugin put in the shared globalThis map directly', () => {
    // What meeovi-atproto / meeovi-activitypub do from their Nitro plugins.
    g[FEDERATION_REGISTRY] = new Map([['atproto', fakeNetwork('atproto')]])
    expect(useFederationNetwork('atproto').label).toBe('ATPROTO')
  })

  it('looks networks up case-insensitively and 404s unknown ones', () => {
    registerFederationNetwork(fakeNetwork('activitypub'))
    expect(useFederationNetwork('ActivityPub').id).toBe('activitypub')
    expect(() => useFederationNetwork('nostr')).toThrowError(expect.objectContaining({ statusCode: 404 }))
  })

  it('reports capabilities and 501s a missing one', async () => {
    const net = fakeNetwork('atproto', { profile: async (h) => ({ id: 'did:x', network: 'atproto', handle: h }) })
    expect(federationCapabilities(net)).toEqual(['profile'])
    expect((await requireCapability(net, 'profile')('alice.test'))?.handle).toBe('alice.test')
    expect(() => requireCapability(net, 'publish')).toThrowError(expect.objectContaining({ statusCode: 501 }))
  })

  it('turns library errors into a 502 but keeps h3 errors', () => {
    const net = fakeNetwork('activitypub')
    expect(() => federationError(net, new Error('ECONNRESET'))).toThrowError(expect.objectContaining({ statusCode: 502 }))
    const h3 = { statusCode: 404, statusMessage: 'Not here' }
    expect(() => federationError(net, h3)).toThrow(expect.objectContaining({ statusCode: 404 }))
  })
})

// Protocol-neutral helpers moved from adapter-federation (same cases).
describe('federation helpers', () => {
  it('extracts attachments across protocols', () => {
    const ap = extractFederationAttachments('activitypub', {
      object: { attachment: [{ id: 'a1', url: 'https://cdn.test/pic.jpg', mediaType: 'image/jpeg' }] },
    })
    const at = extractFederationAttachments('atproto', {
      post: { embed: { images: [{ image: { url: 'https://cdn.test/sky.png', mimeType: 'image/png' } }] } },
    })
    expect(ap[0]?.type).toBe('image')
    expect(at[0]?.url).toBe('https://cdn.test/sky.png')
  })

  it('creates moderation payloads and timeline cursors', () => {
    const event = createModerationEvent({
      protocol: 'activitypub',
      action: 'flag',
      actor: 'https://example.social/users/mod',
      target: 'https://example.social/posts/1',
      reason: 'spam',
    })
    expect(toActivityPubFlag(event).type).toBe('Flag')

    const cursor = encodeSyncCursor({ protocol: 'atproto', createdAt: '2026-01-01T00:00:00.000Z', id: 'post-1' })
    expect(decodeSyncCursor(cursor)?.id).toBe('post-1')

    const merged = mergeProtocolTimelines([
      [{ id: '1', protocol: 'activitypub', createdAt: '2026-01-01T00:00:00.000Z', payload: {} }],
      [{ id: '2', protocol: 'atproto', createdAt: '2026-01-02T00:00:00.000Z', payload: {} }],
    ])
    expect(merged[0]?.id).toBe('2')
  })
})
