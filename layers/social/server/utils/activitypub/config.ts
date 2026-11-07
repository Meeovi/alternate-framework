/**
 * Meeovi on the fediverse (ActivityPub, via Fedify — server/federation.ts).
 *
 * Only one server federates: ACTIVITYPUB_FEDERATION=true (meeovi.com). The
 * demo shares the database and must not answer or send as meeovi.com.
 * Every id is on the canonical site origin (NUXT_PUBLIC_SITE_URL), whatever
 * host the request came in on.
 *
 * Actors and their identifiers (the {identifier} in /ap/actors/{identifier}):
 *   u-<user uuid>      a member who turned it on   handle @<username>
 *   shop-<username>    a seller's shop             handle @shop-<username>
 *   meeovi             the site: all new products  handle @meeovi
 *   space-<id>         a public space (Group)      handle @space-<slug or id>
 *   list-<id>          a public list               handle @list-<id>
 * Member usernames can't contain "-" (and "meeovi" is reserved), so these
 * handles never collide.
 */

export const federationEnabled = () => process.env.ACTIVITYPUB_FEDERATION === 'true'

export const siteOrigin = () => {
  const raw = String(process.env.NUXT_PUBLIC_SITE_URL || 'https://meeovi.com').replace(/\/+$/, '')
  try {
    return new URL(raw).origin
  } catch {
    return 'https://meeovi.com'
  }
}

export const siteHost = () => new URL(siteOrigin()).host

export const SITE_IDENTIFIER = 'meeovi'

export type ActorKind = 'member' | 'shop' | 'site' | 'space' | 'list'
export type ParsedIdentifier = { kind: ActorKind, key: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const USERNAME = /^[a-z0-9_.]{1,64}$/i
const ID = /^\d{1,12}$/

/** 'u-<uuid>' → { kind: 'member', key: uuid }, …; null when it isn't one of ours. */
export function parseIdentifier(identifier: string): ParsedIdentifier | null {
  if (identifier === SITE_IDENTIFIER) return { kind: 'site', key: SITE_IDENTIFIER }
  const match = /^(u|shop|space|list)-(.+)$/.exec(identifier)
  if (!match) return null
  const [, prefix, key] = match as unknown as [string, string, string]
  if (prefix === 'u') return UUID.test(key) ? { kind: 'member', key: key.toLowerCase() } : null
  if (prefix === 'shop') return USERNAME.test(key) ? { kind: 'shop', key: key.toLowerCase() } : null
  if (prefix === 'space') return ID.test(key) ? { kind: 'space', key } : null
  return ID.test(key) ? { kind: 'list', key } : null
}

export const memberIdentifier = (userId: string) => `u-${userId.toLowerCase()}`
export const shopIdentifier = (username: string) => `shop-${username.toLowerCase()}`
export const spaceIdentifier = (id: string | number) => `space-${id}`
export const listIdentifier = (id: string | number) => `list-${id}`

/** Where a Meeovi item lives on the site (links in posted objects). */
export const sitePaths = {
  profile: (username: string) => `/u/${encodeURIComponent(username)}`,
  note: (note: { slug?: string | null, id: string | number }) => `/connect/note/${encodeURIComponent(String(note.slug || note.id))}`,
  product: (product: { slug?: string | null, id: string | number }) => `/product/${encodeURIComponent(String(product.slug || product.id))}`,
  vibe: (id: string | number) => `/connect/vibe/${id}`,
  space: (space: { slug?: string | null, id: string | number }) => `/connect/space/${encodeURIComponent(String(space.slug || space.id))}`,
  list: (list: { slug?: string | null, id: string | number }) => `/lists/list/${encodeURIComponent(String(list.slug || list.id))}`,
}

export const siteLink = (path: string) => new URL(path, siteOrigin()).href

/** Published / public statuses are written in mixed case in Directus ("Public", "published"). */
export const isPublicStatus = (status: unknown) => ['public', 'published'].includes(String(status ?? '').toLowerCase())
