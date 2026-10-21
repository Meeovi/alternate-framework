import { beforeEach, describe, expect, it } from 'vitest'
import { checkSpam, contentText, resetSpamHistory } from '../../server/utils/spam'

beforeEach(() => resetSpamHistory())

describe('spam filter', () => {
  it('lets ordinary comments through, links included', () => {
    expect(checkSpam('Loved this chapter! The ending surprised me.').spam).toBe(false)
    expect(checkSpam('The full recipe is at https://example.com/recipe if anyone wants it').spam).toBe(false)
    expect(checkSpam('').spam).toBe(false)
  })

  it('catches classic spam phrases and link farms', () => {
    expect(checkSpam('Double your bitcoin today, contact me on WhatsApp +1 555').spam).toBe(true)
    expect(checkSpam('best deals https://a.xyz https://b.top https://c.click').spam).toBe(true)
  })

  it('is stricter about links from brand-new accounts', () => {
    expect(checkSpam('see bit.ly/xyz', { accountAgeHours: 1 }).spam).toBe(true)
    expect(checkSpam('see https://example.com', { accountAgeHours: 1 }).score).toBeGreaterThan(checkSpam('see https://example.com', { accountAgeHours: 500 }).score)
  })

  it('catches the same text posted in several places, and flooding', () => {
    const text = 'Join my channel for free giveaways every day'
    expect(checkSpam(text, { authorId: 'u1', scope: 'room-a' }).spam).toBe(false)
    expect(checkSpam(text, { authorId: 'u1', scope: 'room-b' }).spam).toBe(true)
    // Someone else saying the same thing isn't a repeat.
    expect(checkSpam(text, { authorId: 'u2', scope: 'room-a' }).spam).toBe(false)

    const now = Date.now()
    let last = checkSpam('msg 0', { authorId: 'u3', scope: 'r' }, now)
    for (let i = 1; i <= 8; i++) last = checkSpam(`msg ${i}`, { authorId: 'u3', scope: 'r' }, now + i * 1000)
    expect(last.reasons).toContain('posting too fast')
  })

  it('adds the blocklist from NUXT_SPAM_BLOCKLIST', () => {
    process.env.NUXT_SPAM_BLOCKLIST = 'acme pills, cheap watches'
    try {
      expect(checkSpam('Get cheap watches now').spam).toBe(false)
      expect(checkSpam('Get cheap watches now and acme pills').spam).toBe(true)
    } finally {
      delete process.env.NUXT_SPAM_BLOCKLIST
    }
  })

  it('reads the prose fields of a payload, without markup', () => {
    expect(contentText({ title: 'Hi', content: '<p>there</p>', image_url: 'x' }, ['title', 'content'])).toBe('Hi\n there ')
  })
})
