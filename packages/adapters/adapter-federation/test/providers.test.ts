import { describe, expect, it } from 'vitest'

import { encodeSalmonEnvelope } from '../src/providers/ostatus/salmon'
import { buildWebsubSubscribeRequest } from '../src/providers/ostatus/websub'
import { createOStatusProvider } from '../src/providers/ostatus/provider'
import {
  normalizeActivityStreamsActor,
  normalizeActivityStreamsPost,
  toOrderedItems,
} from '../src/providers/activitypub/activitystreams'
import { extractFederationAttachments } from '../src/media/attachments'
import { createModerationEvent, toActivityPubFlag } from '../src/moderation/events'
import { decodeSyncCursor, encodeSyncCursor, mergeProtocolTimelines } from '../src/sync/timeline'
import { createFederationProviders } from '../src/providers'

describe('federation providers', () => {
  it('normalizes activitypub actor and post payloads', () => {
    const actor = normalizeActivityStreamsActor({
      id: 'https://example.social/users/alice',
      preferredUsername: 'alice',
      name: 'Alice',
    })

    const post = normalizeActivityStreamsPost({
      object: {
        id: 'post-1',
        content: 'hello fediverse',
        published: '2026-01-01T00:00:00.000Z',
      },
      actor,
    })

    expect(actor.username).toBe('alice')
    expect(post.id).toBe('post-1')
    expect(post.author.id).toBe('https://example.social/users/alice')
  })

  it('builds a websub subscribe payload', () => {
    const form = buildWebsubSubscribeRequest({
      callback: 'https://app.test/callback',
      topic: 'https://example.social/users/alice',
      leaseSeconds: 3600,
    })

    expect(form.get('hub.mode')).toBe('subscribe')
    expect(form.get('hub.lease_seconds')).toBe('3600')
  })

  it('encodes salmon envelopes and collection arrays', () => {
    const xml = encodeSalmonEnvelope({ hello: 'world' })
    expect(xml).toContain('<salmon>')

    expect(toOrderedItems({ orderedItems: [1, 2] })).toEqual([1, 2])
    expect(toOrderedItems({ items: [3] })).toEqual([3])
    expect(toOrderedItems(null)).toEqual([])
  })

  it('builds ostatus posts and provider helpers', () => {
    const provider = createOStatusProvider()
    const post = provider.createPost({
      id: 'os-1',
      author: '@alice@example.social',
      content: 'from ostatus',
    })

    expect(post.protocol).toBe('ostatus')
    expect(post.envelope).toContain('<salmon>')

    const profile = provider.normalizeProfile({
      id: 'acct:alice@example.social',
      preferredUsername: 'alice',
      salmonEndpoint: 'https://example.social/salmon',
    })
    expect(profile.handle).toBe('alice')

    const form = provider.buildSubscribeRequest({
      callback: 'https://app.test/sub',
      topic: 'https://example.social/users/alice',
    })
    expect(form.get('hub.mode')).toBe('subscribe')
  })

  it('extracts attachments across protocols', () => {
    const ap = extractFederationAttachments('activitypub', {
      object: {
        attachment: [{ id: 'a1', url: 'https://cdn.test/pic.jpg', mediaType: 'image/jpeg' }],
      },
    })

    const at = extractFederationAttachments('atproto', {
      post: {
        embed: {
          images: [{ image: { url: 'https://cdn.test/sky.png', mimeType: 'image/png' } }],
        },
      },
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

    const flag = toActivityPubFlag(event)
    expect(flag.type).toBe('Flag')

    const cursor = encodeSyncCursor({
      protocol: 'atproto',
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 'post-1',
    })
    expect(decodeSyncCursor(cursor)?.id).toBe('post-1')

    const merged = mergeProtocolTimelines([
      [{ id: '1', protocol: 'activitypub', createdAt: '2026-01-01T00:00:00.000Z', payload: {} }],
      [{ id: '2', protocol: 'atproto', createdAt: '2026-01-02T00:00:00.000Z', payload: {} }],
    ])
    expect(merged[0]?.id).toBe('2')
  })

  it('registers multi-protocol federation providers', () => {
    const providers = createFederationProviders()

    expect(typeof providers.activitypub.getProfile).toBe('function')
    expect(typeof providers.ostatus.createPost).toBe('function')
    expect(typeof providers.media.extractAttachments).toBe('function')
    expect(typeof providers.sync.mergeTimelines).toBe('function')
  })
})
