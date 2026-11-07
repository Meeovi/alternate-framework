import { describe, expect, it, vi } from 'vitest'

// The database isn't touched: only the encryption is under test here.
vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('#auth/server/database/migrations/schema', () => ({ federationConnections: {} }))

process.env.FEDERATION_CREDENTIALS_KEY = 'test-key-for-federation-connections'
const { openCredentials, sealCredentials } = await import('../../server/utils/federation-connections')

describe('stored network credentials', () => {
  it('are encrypted, and read back only unchanged', () => {
    const creds = { server: 'https://gnusocial.example', username: 'alice', password: 'correct horse' }
    const sealed = sealCredentials(creds)
    expect(sealed).toMatch(/^v1\.[\w-]+\.[\w-]+\.[\w-]+$/)
    expect(sealed).not.toContain('correct horse')
    expect(sealed).not.toContain('alice')
    expect(openCredentials(sealed)).toEqual(creds)
    // Fresh IV each time: the same password never gives the same text.
    expect(sealCredentials(creds)).not.toBe(sealed)
    const [v, iv, tag, body] = sealed.split('.')
    const flipped = body!.slice(0, -2) + (body!.endsWith('A') ? 'B' : 'A') + body!.slice(-1)
    expect(openCredentials([v, iv, tag, flipped].join('.'))).toBeUndefined()
    expect(openCredentials('v0.x.y.z')).toBeUndefined()
    expect(openCredentials(null)).toBeUndefined()
  })
})

describe('note links for other networks', async () => {
  const { federatedNoteKey, federatedNoteRef, postPath } = await import('../../app/utils/postPath')
  it('name the network in the key, so they open on the right network', () => {
    const post = { network: 'ostatus', id: 'gnusocial.example~1234', author: { handle: 'alice@gnusocial.example' } }
    const path = postPath(post)!
    expect(path).toBe('/connect/note/@alice%40gnusocial.example/ostatus%3Agnusocial.example~1234')
    expect(federatedNoteRef(path.replace('/connect/note/', ''))).toEqual({ network: 'ostatus', author: 'alice@gnusocial.example', key: 'gnusocial.example~1234' })
    expect(federatedNoteKey(post)).toBe('ostatus:gnusocial.example-1234')
    // Bluesky and the Fediverse are unchanged.
    expect(federatedNoteRef('@bob@mastodon.social/113456789')).toEqual({ network: 'activitypub', author: 'bob@mastodon.social', key: '113456789' })
    expect(postPath({ network: 'directus', slug: 'hello' })).toBe('/connect/note/hello')
  })
})
