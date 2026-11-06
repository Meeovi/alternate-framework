import { describe, expect, it } from 'vitest'
import { moderate } from '../runtime/moderation'
import { toFederatedPost } from '../runtime/network'

describe('moderate', () => {
  it('leaves unlabelled and informational content alone', () => {
    expect(moderate()).toBeNull()
    expect(moderate([], undefined)).toBeNull()
    expect(moderate(['bot'], ['!no-promote'])).toBeNull()
  })

  it('hides takedowns and spam, even with other labels', () => {
    expect(moderate(['porn', '!takedown'])).toEqual({ action: 'hide', reasons: ['!takedown'], signedInOnly: undefined })
    expect(moderate(undefined, ['spam'])?.action).toBe('hide')
  })

  it('blurs adult and graphic media', () => {
    expect(moderate(['nudity'])).toEqual({ action: 'blur', reasons: ['nudity'], signedInOnly: undefined })
  })

  it('warns on !warn, known warning labels and any label it does not know', () => {
    expect(moderate(['!warn'])?.action).toBe('warn')
    expect(moderate(['a-new-meeovi-label'])).toEqual({ action: 'warn', reasons: ['a-new-meeovi-label'], signedInOnly: undefined })
    // A warning covers the whole note, media included.
    expect(moderate(['misleading', 'gore'])).toEqual({ action: 'warn', reasons: ['misleading', 'gore'], signedInOnly: undefined })
  })

  it('marks authors who asked not to be shown signed out', () => {
    expect(moderate(undefined, ['!no-unauthenticated'])).toEqual({ action: 'warn', reasons: [], signedInOnly: true })
    expect(moderate(['nudity'], ['!no-unauthenticated'])?.signedInOnly).toBe(true)
  })
})

describe('toFederatedPost', () => {
  it('carries the note and author labels and their moderation', () => {
    const note = toFederatedPost({
      uri: 'at://did:plc:a/app.bsky.feed.post/1',
      text: 'hi',
      createdAt: '2026-11-06T00:00:00Z',
      authorDid: 'did:plc:a',
      authorHandle: 'a.test',
      labels: ['nudity'],
      authorLabels: ['bot'],
    } as any)
    expect(note.labels).toEqual(['nudity', 'bot'])
    expect(note.moderation).toEqual({ action: 'blur', reasons: ['nudity'], signedInOnly: undefined })
  })
})
