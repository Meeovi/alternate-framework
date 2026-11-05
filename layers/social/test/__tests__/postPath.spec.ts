import { describe, expect, it } from 'vitest'
import { federatedNoteRef, newPostSlug, postPath } from '../../app/utils/postPath'

describe('postPath', () => {
  it('links by slug', () => {
    expect(postPath({ slug: 'welcome-to-meeovi', id: 20 })).toBe('/connect/note/welcome-to-meeovi')
  })
  it('falls back to the id when the slug is missing or empty', () => {
    expect(postPath({ slug: null, id: 66 })).toBe('/connect/note/66')
    expect(postPath({ slug: '', id: 66 })).toBe('/connect/note/66')
  })
  it('opens Bluesky and Fediverse notes on Meeovi', () => {
    expect(postPath({ network: 'atproto', id: 'at://did:plc:abc/app.bsky.feed.post/3kxyz', author: { handle: 'alice.bsky.social' } }))
      .toBe('/connect/note/@alice.bsky.social/3kxyz')
    // the older timeline cards' id: atproto:<at:// URI>
    expect(postPath({ network: 'atproto', id: 'atproto:at://did:plc:abc/app.bsky.feed.post/3kxyz', author: { handle: 'alice.bsky.social' } }))
      .toBe('/connect/note/@alice.bsky.social/3kxyz')
    expect(postPath({ network: 'activitypub', id: '113456789', author: { handle: 'bob@mastodon.social' } }))
      .toBe('/connect/note/@bob%40mastodon.social/113456789')
    expect(postPath({ network: 'activitypub', id: '1', author: {} })).toBeNull()
  })
  it('gives no link without a slug or id', () => {
    expect(postPath({})).toBeNull()
    expect(postPath(null)).toBeNull()
  })
})

describe('newPostSlug', () => {
  it('uses the opening words, without HTML or accents, plus a suffix', () => {
    expect(newPostSlug('<p>Café night: <b>Live</b> music!</p>')).toMatch(/^cafe-night-live-music-[a-z0-9]{1,6}$/)
  })
  it('keeps at most eight words', () => {
    expect(newPostSlug('one two three four five six seven eight nine ten')).toMatch(/^one-two-three-four-five-six-seven-eight-[a-z0-9]+$/)
  })
  it('falls back to post-<suffix> for text with no words', () => {
    expect(newPostSlug('🎉🎉')).toMatch(/^post-[a-z0-9]+$/)
    expect(newPostSlug(null)).toMatch(/^post-[a-z0-9]+$/)
  })
  it('makes different slugs for the same text', () => {
    expect(newPostSlug('hello world')).not.toBe(newPostSlug('hello world'))
  })
})

describe('federatedNoteRef', () => {
  it('reads the network from the handle', () => {
    expect(federatedNoteRef('@alice.bsky.social/3kxyz')).toEqual({ network: 'atproto', author: 'alice.bsky.social', key: '3kxyz' })
    expect(federatedNoteRef('@bob%40mastodon.social/113456789')).toEqual({ network: 'activitypub', author: 'bob@mastodon.social', key: '113456789' })
    expect(federatedNoteRef('@bob@mastodon.social/113456789')).toEqual({ network: 'activitypub', author: 'bob@mastodon.social', key: '113456789' })
  })
  it('is null for Meeovi notes', () => {
    expect(federatedNoteRef('welcome-to-meeovi')).toBeNull()
    expect(federatedNoteRef('66')).toBeNull()
  })
})
