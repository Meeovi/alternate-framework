import { and, eq, isNotNull, isNull, or } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import type { FederatedPost } from '../../shared/types/federation'
import { useAtprotoClient } from '@mframework/meeovi-atproto/client'
import { toFederatedPost } from '@mframework/meeovi-atproto/federation'
import { federationNetworks, withNetworkTimeout } from './federation'
import { crosspostedUris } from './crosspost'

/**
 * Meeovi's Bluesky feed generator: feeds any Bluesky app can subscribe to,
 * served by this site as did:web:<ATPROTO_FEEDGEN_HOSTNAME> (routes in
 * server/routes/.well-known/did.json.get.ts and server/routes/xrpc/).
 *
 * A feed only lists Bluesky posts (a feed is post URIs that Bluesky apps
 * then load themselves), so the feeds are:
 *  - members: recent notes by Meeovi members who connected a Bluesky
 *    account (users.atproto_did), and by Meeovi's own account;
 *  - meeovi:  the latest products and community notes Meeovi posted to
 *    Bluesky (server/utils/crosspost.ts: products from the site's account,
 *    notes from members' own accounts), plus Bluesky posts linking to
 *    meeovi.com or tagged #meeovi.
 * Everything is read back through Bluesky, which applies moderation
 * (anything Bluesky's or Meeovi's Ozone labels as hidden is dropped, and
 * deleted posts fall out). Lists are rebuilt at most every few minutes.
 *
 * The feeds appear in Bluesky apps once their app.bsky.feed.generator
 * records are published in the publisher account's repo (see
 * packages/plugins/Social/meeovi-atproto/scripts/publish-feeds.mjs).
 */

export type FeedDefinition = {
  rkey: string
  displayName: string
  description: string
  build: () => Promise<FederatedPost[]>
}

/** The host this generator answers as (did:web:<host>), or null when off. */
export function feedgenHostname(): string | null {
  const host = String(process.env.ATPROTO_FEEDGEN_HOSTNAME || '').trim().toLowerCase()
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) ? host : null
}

export const feedgenDid = () => (feedgenHostname() ? `did:web:${feedgenHostname()}` : null)

/** The account whose repo holds the feed records (the site's Bluesky account). */
export function feedPublisherDid(): string | null {
  const did = String(process.env.ATPROTO_FEEDGEN_PUBLISHER_DID || process.env.ATPROTO_IDENTIFIER || '').trim()
  return did.startsWith('did:') ? did : null
}

const atproto = () => federationNetworks().find((n) => n.id === 'atproto') ?? null

const newestFirst = (a: FederatedPost, b: FederatedPost) => Date.parse(b.createdAt) - Date.parse(a.createdAt)

/** Unique Bluesky posts, newest first, without replies' duplicates. */
function merge(lists: FederatedPost[][], limit: number): FederatedPost[] {
  const seen = new Set<string>()
  return lists.flat()
    .filter((post) => post?.network === 'atproto' && /^at:\/\//.test(post.id) && !seen.has(post.id) && seen.add(post.id))
    .sort(newestFirst)
    .slice(0, limit)
}

async function memberNotes(): Promise<FederatedPost[]> {
  const network = atproto()
  if (!network?.feed) return []
  const members = await db.select({ did: users.atprotoDid }).from(users).where(and(
    isNotNull(users.atprotoDid),
    isNull(users.deletedAt),
    or(isNull(users.authBanned), eq(users.authBanned, false)),
  )).limit(200)
  // Members, plus the site's own Bluesky account (meeovi.com).
  const dids = [...new Set([feedPublisherDid(), ...members.map((m) => m.did)])].filter((d): d is string => !!d && d.startsWith('did:'))
  // A few at a time: one author feed per member.
  const lists: FederatedPost[][] = []
  for (let i = 0; i < dids.length; i += 8) {
    lists.push(...await Promise.all(dids.slice(i, i + 8).map((did) =>
      withNetworkTimeout(network.feed!(did, { limit: 25 })).catch(() => [] as FederatedPost[]))))
  }
  // Their own notes only (an author feed also carries their reposts).
  return merge(lists.map((list, i) => list.filter((post) => post.author?.id === dids[i])), 300)
}

/** Products and notes Meeovi posted to Bluesky, as Bluesky has them now. */
async function crossposted(): Promise<FederatedPost[]> {
  const rows = await crosspostedUris(300).catch((error) => {
    console.error('[feedgen] crossposts:', (error as Error)?.message || error)
    return []
  })
  if (!rows.length) return []
  const client = useAtprotoClient()
  const uris = rows.map((r) => r.uri)
  const posts: FederatedPost[] = []
  for (let i = 0; i < uris.length; i += 25) {
    const found = await withNetworkTimeout(client.getPosts(uris.slice(i, i + 25))).catch(() => [])
    posts.push(...found.map(toFederatedPost))
  }
  return posts.filter((post) => post.moderation?.action !== 'hide')
}

async function aboutMeeovi(): Promise<FederatedPost[]> {
  const network = atproto()
  const queries = ['domain:meeovi.com', '#meeovi']
  const [own, ...searches] = await Promise.all([
    crossposted(),
    ...queries.map((q) => network?.searchPosts
      ? withNetworkTimeout(network.searchPosts(q, { limit: 100 })).catch(() => [] as FederatedPost[])
      : Promise.resolve([] as FederatedPost[])),
  ])
  return merge([own, ...searches], 300)
}

export const FEEDS: FeedDefinition[] = [
  {
    rkey: 'meeovi-members',
    displayName: 'Meeovi Members',
    description: 'The latest from people on Meeovi (meeovi.com) who connected their Bluesky account.',
    build: memberNotes,
  },
  {
    rkey: 'meeovi',
    displayName: 'Meeovi',
    description: 'The latest products and notes from the Meeovi community (meeovi.com), plus Bluesky posts about Meeovi.',
    build: aboutMeeovi,
  },
]

// Rebuilt at most every 3 minutes per feed (one rebuild at a time).
const CACHE_MS = 3 * 60 * 1000
const cache = new Map<string, { at: number, posts: FederatedPost[], building?: Promise<FederatedPost[]> }>()

export async function feedPosts(rkey: string): Promise<FederatedPost[] | null> {
  const feed = FEEDS.find((f) => f.rkey === rkey)
  if (!feed) return null
  const entry = cache.get(rkey)
  if (entry && Date.now() - entry.at < CACHE_MS) return entry.posts
  if (entry?.building) return entry.posts
  const building = feed.build()
    .then((posts) => {
      cache.set(rkey, { at: Date.now(), posts })
      return posts
    })
    .catch((error) => {
      console.error(`[feedgen] ${rkey}:`, (error as Error)?.message || error)
      cache.set(rkey, { at: Date.now() - CACHE_MS + 30_000, posts: entry?.posts ?? [] })
      return entry?.posts ?? []
    })
  cache.set(rkey, { at: entry?.at ?? 0, posts: entry?.posts ?? [], building })
  // First build: wait for it; later ones refresh in the background.
  return entry?.posts?.length ? entry.posts : building
}
