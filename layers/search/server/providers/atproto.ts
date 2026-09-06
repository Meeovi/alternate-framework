// server/providers/atproto.ts
//
// Federates AT Protocol (Bluesky) posts and profiles from this deployment's
// hosted PDS into the shared SearchProvider contract, following the same
// shape as directus.ts/magento.ts — a live query against an external
// system at request time, not a synced index. All the actual XRPC work
// (app.bsky.feed.searchPosts / app.bsky.actor.searchActors) lives in
// adapter-federation's AtprotoClient — this file only calls into it and
// reshapes the result, same division of responsibility magento.ts uses for
// adapter-magento's MagentoAdapter.
import { useRuntimeConfig } from '#imports'
import { AtprotoClient, type AtprotoPostRecord, type AtprotoActorRecord } from '@mframework/adapter-federation/clients/atproto'
import type { NormalizedHit, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type AtprotoConfig = {
  enabled: boolean
  service: string
  identifier?: string
  password?: string
}

function getConfig(): AtprotoConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { atproto: AtprotoConfig }).atproto
}

let _clientPromise: Promise<AtprotoClient> | null = null
let _clientKey: string | null = null

// Confirmed live against sky.meeovicms.com: app.bsky.feed.searchPosts /
// app.bsky.actor.searchActors 401 with AuthMissing when called
// unauthenticated on this PDS — unlike the public bsky.social AppView,
// this one requires a logged-in session even for read-only search.
// Logs in once with a service account (ATPROTO_IDENTIFIER/
// ATPROTO_APP_PASSWORD by default — see nuxt.config.ts) and reuses that
// client for the life of the process; AtpAgent's CredentialSession
// auto-refreshes the access token on expiry using the refresh token, so
// this never needs to re-login itself. If no service-account credentials
// are configured, falls back to an unauthenticated client — fine against
// a PDS that doesn't require auth for search, a 401 on every request
// against one that does (surfaced as a per-request provider failure, not
// a crash — see the Promise.allSettled below).
async function getClient(config: AtprotoConfig): Promise<AtprotoClient> {
  const key = `${config.service}:${config.identifier || ''}`
  if (_clientPromise && _clientKey === key) return _clientPromise

  _clientKey = key
  _clientPromise = (async () => {
    const client = new AtprotoClient({ serviceUrl: config.service })
    if (config.identifier && config.password) {
      await client.login(config.identifier, config.password)
    }
    return client
  })().catch((error) => {
    // Don't cache a failed login — the next search() call gets a fresh
    // attempt instead of permanently falling back to unauthenticated.
    _clientPromise = null
    throw error
  })

  return _clientPromise
}

function postToHit(post: AtprotoPostRecord): NormalizedHit {
  return {
    id: post.uri,
    // No BM25-comparable relevance score from app.bsky.feed.searchPosts —
    // results already arrive ranked by the PDS's own relevance/recency
    // (per `sort`), so every hit here ties, same fallback magento.ts and
    // directus.ts use for the same reason (external system, no exposed
    // score).
    score: 1,
    source: {
      type: 'atproto_post',
      title: post.authorDisplayName || post.authorHandle,
      name: post.authorDisplayName || post.authorHandle,
      description: post.text,
      image: post.images?.[0]?.thumb ?? post.authorAvatar ?? null,
      authorHandle: post.authorHandle,
      authorDisplayName: post.authorDisplayName,
      authorAvatar: post.authorAvatar,
      createdAt: post.createdAt,
      hashtags: post.hashtags ?? [],
      likeCount: post.likeCount ?? 0,
      repostCount: post.repostCount ?? 0,
      replyCount: post.replyCount ?? 0,
      // Picked up automatically by ResultCard.vue's external-link fallback
      // (no atproto_post entry needed in its ROUTE_BUILDERS map) — see
      // app/components/results/ResultCard.vue's `link` computed.
      url: bskyPostUrl(post),
    },
  }
}

function actorToHit(actor: AtprotoActorRecord): NormalizedHit {
  return {
    id: actor.did,
    score: 1,
    source: {
      type: 'atproto_actor',
      title: actor.displayName || actor.handle,
      name: actor.displayName || actor.handle,
      description: actor.description,
      image: actor.avatar ?? null,
      authorHandle: actor.handle,
      followersCount: actor.followersCount ?? 0,
      url: `https://bsky.app/profile/${actor.handle}`,
    },
  }
}

function bskyPostUrl(post: AtprotoPostRecord): string {
  const rkey = post.uri.split('/').pop()
  return `https://bsky.app/profile/${post.authorHandle}/post/${rkey}`
}

export const atprotoProvider: SearchProvider = {
  id: 'atproto',

  isEnabled() {
    const config = getConfig()
    return Boolean(config?.enabled && config?.service)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()

    if (!options.query.trim()) {
      // app.bsky.feed.searchPosts requires a non-empty query (unlike the
      // SQL/OpenSearch providers, which can fall back to a match-all) —
      // return an empty page rather than letting the PDS 400 on every
      // empty-query render of the results page.
      return { provider: this.id, items: [], total: 0, facets: {}, tookMs: Date.now() - start }
    }

    let client: AtprotoClient
    try {
      client = await getClient(config)
    } catch (error) {
      console.error('[atprotoProvider] service-account login failed:', error)
      return { provider: this.id, items: [], total: 0, facets: {}, tookMs: Date.now() - start }
    }

    // Split the page budget across posts and actors so a single query
    // surfaces both kinds of atproto results without either one crowding
    // the other out entirely. Each request is independent (no shared
    // cursor between the two XRPC calls), matching federate.ts's own
    // "overfetch from the top, re-derive order every request" contract.
    const postLimit = Math.max(1, Math.ceil(options.pageSize * 0.75))
    const actorLimit = Math.max(1, options.pageSize - postLimit)

    const [postsResult, actorsResult] = await Promise.allSettled([
      client.searchPosts({ query: options.query, limit: Math.min(postLimit, 100) }),
      actorLimit > 0 ? client.searchActors({ query: options.query, limit: Math.min(actorLimit, 25) }) : Promise.resolve({ actors: [] as AtprotoActorRecord[] }),
    ])

    const items: NormalizedHit[] = []
    if (postsResult.status === 'fulfilled') {
      items.push(...postsResult.value.posts.map(postToHit))
    } else {
      console.error('[atprotoProvider] searchPosts failed:', postsResult.reason)
    }
    if (actorsResult.status === 'fulfilled') {
      items.push(...actorsResult.value.actors.map(actorToHit))
    } else {
      console.error('[atprotoProvider] searchActors failed:', actorsResult.reason)
    }

    return {
      provider: this.id,
      // atproto's search endpoints don't return a total match count, only
      // a page + cursor — approximated the same way directus.ts is (this
      // page's item count), which federate.ts's own docs already treat as
      // the standard tradeoff for a federated provider with no exact-count
      // capability.
      total: items.length,
      items,
      facets: {},
      tookMs: Date.now() - start,
    }
  },
}
