// ActivityPub (Mastodon & the Mastodon-API Fediverse) as a
// federation network in the social layer (see runtime/federation.ts), via
// masto.js against one instance — ACTIVITYPUB_SERVER_URL, default
// mastodon.social.
//
// Without ACTIVITYPUB_ACCESS_TOKEN it reads anonymously: instance status,
// public profiles and feeds, and hashtag timelines (Mastodon only offers
// full-text post search to signed-in accounts, so search falls back to the
// query's first word as a hashtag). With a token it searches posts and can
// publish as that account.
import { createMastodonPublicClient, isMastoHttpErrorStatus, type mastodon } from './client'
import { type FederatedActor, type FederatedPost, type FederationNetwork } from './federation'

const NETWORK = 'activitypub'
export const DEFAULT_ACTIVITYPUB_SERVER = 'https://mastodon.social'

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ' }

/** Mastodon HTML (content, bio) → plain text. */
export function htmlToText(html: string | null | undefined): string {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1]?.toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return Number.isFinite(code) ? String.fromCodePoint(code) : m
      }
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .trim()
}

const mediaType = (t: string): 'image' | 'video' | 'audio' | 'other' =>
  t === 'image' ? 'image' : t === 'video' || t === 'gifv' ? 'video' : t === 'audio' ? 'audio' : 'other'

export function toFederatedActor(account: mastodon.v1.Account, domain: string): FederatedActor {
  return {
    id: account.id,
    network: NETWORK,
    // Local accounts' acct has no domain.
    handle: account.acct.includes('@') ? account.acct : `${account.acct}@${domain}`,
    displayName: account.displayName || undefined,
    avatar: account.avatar || undefined,
    bio: htmlToText(account.note) || undefined,
    url: account.url || undefined,
    followers: account.followersCount,
    following: account.followingCount,
    posts: account.statusesCount,
  }
}

export function toFederatedPost(status: mastodon.v1.Status, domain: string): FederatedPost {
  const s = status.reblog ?? status // a boost shows the boosted post
  return {
    id: s.id,
    network: NETWORK,
    url: s.url || s.uri,
    text: htmlToText(s.content),
    html: s.content,
    createdAt: s.createdAt,
    author: toFederatedActor(s.account, domain),
    media: (s.mediaAttachments ?? []).filter((m) => m.url).map((m) => ({
      url: m.url!,
      preview: m.previewUrl || undefined,
      alt: m.description || undefined,
      type: mediaType(m.type),
    })),
    hashtags: (s.tags ?? []).map((t) => t.name),
    replies: s.repliesCount,
    reposts: s.reblogsCount,
    likes: s.favouritesCount,
  }
}

/** First word of a query as a hashtag name ("#Fediverse news" → "Fediverse"). */
export function queryToHashtag(query: string): string {
  return (String(query).match(/#?([\p{L}\p{N}_]+)/u)?.[1] ?? '').slice(0, 100)
}

export function createActivitypubNetwork(options: { server?: string, accessToken?: string } = {}): FederationNetwork {
  const server = (options.server || DEFAULT_ACTIVITYPUB_SERVER).replace(/\/+$/, '')
  const domain = new URL(server).host
  const token = options.accessToken || undefined
  const client = createMastodonPublicClient(server, token)

  const network: FederationNetwork = {
    id: NETWORK,
    label: 'Fediverse',
    async status() {
      try {
        const instance = await client.v2.instance.fetch()
        const account = token ? (await client.v1.accounts.verifyCredentials()).acct : null
        return {
          configured: true,
          connected: true,
          service: server,
          account: account ? `${account}@${domain}` : null,
          detail: `${instance.title} · Mastodon ${instance.version}`,
        }
      } catch (e) {
        return { configured: true, connected: false, service: server, account: null, detail: (e as Error)?.message }
      }
    },
    async profile(handle) {
      try {
        return toFederatedActor(await client.v1.accounts.lookup({ acct: handle }), domain)
      } catch (e) {
        if (isMastoHttpErrorStatus(e, 404)) return null
        throw e
      }
    },
    async feed(actor, { limit = 20 } = {}) {
      const account = await client.v1.accounts.lookup({ acct: actor })
      const statuses = await client.v1.accounts.$select(account.id).statuses.list({ limit, excludeReplies: true })
      return statuses.map((s) => toFederatedPost(s, domain))
    },
    async searchPosts(query, { limit = 20 } = {}) {
      if (token) {
        const res = await client.v2.search.list({ q: query, type: 'statuses', limit, resolve: false })
        return res.statuses.map((s) => toFederatedPost(s, domain))
      }
      const tag = queryToHashtag(query)
      if (!tag) return []
      const statuses = await client.v1.timelines.tag.$select(tag).list({ limit })
      return statuses.map((s) => toFederatedPost(s, domain))
    },
  }
  if (token) {
    network.publish = async ({ text, ...params }) => {
      const status = await client.v1.statuses.create({ ...(params as object), status: text } as mastodon.rest.v1.CreateStatusParamsWithStatus)
      return toFederatedPost(status, domain)
    }
  }
  return network
}
