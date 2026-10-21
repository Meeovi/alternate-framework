/**
 * Spam scoring for user-written text: discussion messages (Rocket.Chat,
 * checked after they're sent — see meeovi-discussions' moderate route) and
 * content saved through the CMS proxy (posts, spaces, websites…).
 *
 * Heuristics, no third-party service: links (more of them, link
 * shorteners, links from brand-new accounts), well-known spam phrases plus
 * any in NUXT_SPAM_BLOCKLIST, mass mentions, shouting, hidden characters,
 * and — per author — posting the same text again or posting too fast.
 * A score of SPAM_THRESHOLD or more is spam.
 */

export const SPAM_THRESHOLD = 4

export interface SpamVerdict {
  spam: boolean
  score: number
  reasons: string[]
}

export interface SpamContext {
  /** Who wrote it; enables the repeat and flood checks. */
  authorId?: string | null
  /** How old the author's account is, in hours (unknown: no age checks). */
  accountAgeHours?: number | null
  /** Where it's posted, so the same text in one place isn't a repeat elsewhere. */
  scope?: string
}

const LINK = /\bhttps?:\/\/[^\s<>"')]+|\bwww\.[^\s<>"')]+|\b[a-z0-9-]+\.(?:com|net|org|io|xyz|top|click|link|ru|cn|info|biz|shop|site|online|live|club|vip)\b(?:\/[^\s<>"')]*)?/gi
const SHORTENERS = /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|rb\.gy|is\.gd|ow\.ly|shorturl\.at|s\.id|t\.ly|rebrand\.ly|tiny\.cc|linktr\.ee)\b/i
// Top-level domains spam links overwhelmingly use.
const CHEAP_DOMAINS = /\.(?:xyz|top|click|link|vip|online|site|live|club|shop|biz|info|icu|cyou|buzz)(?:[/:?#]|$)/i
const HIDDEN = /[​-‏‪-‮⁠-⁤﻿]/

/** Phrases that are almost never legitimate here. Word-bounded, case-insensitive. */
const SPAM_PHRASES = [
  'viagra', 'cialis', 'casino', 'sportsbook', 'betting tips', 'slot online', 'payday loan', 'loan approval',
  'forex signals', 'binary options', 'crypto giveaway', 'bitcoin giveaway', 'double your bitcoin', 'double your crypto',
  'investment opportunity', 'guaranteed profit', 'guaranteed returns', 'earn money fast', 'make money online',
  'work from home and earn', 'free money', 'cheap followers', 'buy followers', 'buy likes', 'seo services',
  'backlinks', 'escort service', 'hot singles', 'onlyfans', 'contact me on whatsapp', 'whatsapp me', 'dm me on telegram',
  'telegram @', 'click here to claim', 'claim your prize', 'you have won', 'recovery expert', 'hacker for hire',
]

function phraseList(): string[] {
  const extra = (process.env.NUXT_SPAM_BLOCKLIST || '').split(',').map((p) => p.trim().toLowerCase()).filter(Boolean)
  return [...SPAM_PHRASES, ...extra]
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Per-author recent posts, for the repeat and flood checks (this process).
const WINDOW_MS = 10 * 60 * 1000
const FLOOD_WINDOW_MS = 60 * 1000
const FLOOD_MAX = 8
const recent = new Map<string, { at: number, text: string, scope: string }[]>()

function remember(authorId: string, text: string, scope: string, now: number) {
  const list = (recent.get(authorId) ?? []).filter((r) => now - r.at < WINDOW_MS)
  // Only what the repeat check compares; long texts don't pile up in memory.
  list.push({ at: now, text: text.slice(0, 2000), scope })
  recent.set(authorId, list.slice(-50))
  if (recent.size > 10_000) {
    for (const [key, rows] of recent) if (!rows.some((r) => now - r.at < WINDOW_MS)) recent.delete(key)
  }
}

const normalise = (text: string) => text.toLowerCase().replace(HIDDEN, '').replace(/\s+/g, ' ').trim()

/** Scores `text`; remembers it for the author's next check. */
export function checkSpam(text: string, context: SpamContext = {}, now = Date.now()): SpamVerdict {
  const reasons: string[] = []
  let score = 0
  const add = (points: number, reason: string) => { score += points; reasons.push(reason) }
  const body = String(text ?? '')
  const plain = normalise(body)
  if (!plain) return { spam: false, score: 0, reasons }

  const shortened = body.match(new RegExp(SHORTENERS.source, 'gi')) ?? []
  const links = [...new Set([...(body.match(LINK) ?? []), ...shortened])]
  if (links.length >= 3) add(3, `${links.length} links`)
  else if (links.length === 2) add(1, '2 links')
  if (shortened.length) add(2, 'link shortener')
  if (links.some((l) => CHEAP_DOMAINS.test(l))) add(1, 'link to a throwaway domain')
  if (links.length && context.accountAgeHours != null && context.accountAgeHours < 24) add(2, 'link from a new account')

  for (const phrase of phraseList()) {
    if (new RegExp(`(^|[^a-z0-9])${escape(phrase)}([^a-z0-9]|$)`, 'i').test(plain)) add(3, `"${phrase}"`)
  }
  if (/@(all|here|everyone)\b/i.test(body)) add(2, 'mass mention')
  if ((body.match(/@[\w.-]+/g) ?? []).length >= 5) add(2, 'many mentions')
  const letters = body.replace(/[^A-Za-z]/g, '')
  if (letters.length >= 20 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) add(1, 'shouting')
  if (HIDDEN.test(body)) add(1, 'hidden characters')
  if (/(.)\1{9,}/.test(body)) add(1, 'repeated characters')

  if (context.authorId) {
    const scope = context.scope ?? ''
    const history = (recent.get(context.authorId) ?? []).filter((r) => now - r.at < WINDOW_MS)
    const key = plain.slice(0, 2000)
    const repeats = history.filter((r) => r.text === key && plain.length >= 8).length
    // The same message pasted into other rooms is the classic pattern (a
    // short "thanks!" in two places isn't).
    if (plain.length >= 25 && history.some((r) => r.text === key && r.scope !== scope)) add(4, 'same text posted in several places')
    else if (repeats >= 2) add(3, 'same text posted again')
    if (history.filter((r) => now - r.at < FLOOD_WINDOW_MS).length >= FLOOD_MAX) add(3, 'posting too fast')
    remember(context.authorId, plain, scope, now)
  }

  return { spam: score >= SPAM_THRESHOLD, score, reasons }
}

/** The user-written text in a content payload (strings, nested one level). */
export function contentText(data: unknown, fields: readonly string[]): string {
  if (!data || typeof data !== 'object') return ''
  const parts: string[] = []
  for (const field of fields) {
    const value = (data as Record<string, unknown>)[field]
    if (typeof value === 'string') parts.push(value.replace(/<[^>]+>/g, ' '))
  }
  return parts.join('\n')
}

/** For tests. */
export function resetSpamHistory() {
  recent.clear()
}
