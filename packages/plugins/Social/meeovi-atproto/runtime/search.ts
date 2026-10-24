// AT Protocol (Bluesky) posts and profiles for the search layer
// (layers/search), on the shared SearchProvider contract — a live query
// against the PDS at request time, not a synced index. Registered by
// ./server/search.ts through the layer's Symbol.for() registry, so the
// layer has no AT Protocol code at all. The XRPC work
// (app.bsky.feed.searchPosts / app.bsky.actor.searchActors) is
// AtprotoClient's; this file only calls into it and reshapes the result.
import { AtprotoClient, type AtprotoPostRecord, type AtprotoActorRecord } from './client'
import type { NormalizedHit, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './search-types'

export type AtprotoSearchConfig = {
  enabled: boolean
  service: string
  identifier?: string
  password?: string
}

let _clientPromise: Promise<AtprotoClient> | null = null
let _clientKey: string | null = null

// Confirmed live against sky.meeovicms.com: app.bsky.feed.searchPosts /
// app.bsky.actor.searchActors 401 with AuthMissing when called
// unauthenticated on this PDS — unlike the public bsky.social AppView,
// this one requires a logged-in session even for read-only search.
// Logs in once with a service account (ATPROTO_IDENTIFIER/
// ATPROTO_APP_PASSWORD by default — see module.ts) and reuses that
// client for the life of the process; AtpAgent's CredentialSession
// auto-refreshes the access token on expiry using the refresh token, so
// this never needs to re-login itself. If no service-account credentials
// are configured, falls back to an unauthenticated client — fine against
// a PDS that doesn't require auth for search, a 401 on every request
// against one that does (surfaced as a per-request provider failure, not
// a crash — the search layer reports it and answers without atproto).
async function getClient(config: AtprotoSearchConfig): Promise<AtprotoClient> {
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

// Site search is public and shown signed out, so leave out what Bluesky's
// own app hides or blurs by default: adult and graphic content labels,
// moderation takedowns, and accounts that ask not to be shown to
// logged-out viewers. Unlabelled posts can still be explicit; this only
// covers what the network has labelled.
const HIDDEN_LABELS = new Set([
  'porn', 'sexual', 'nudity', 'graphic-media', 'gore', 'nsfl',
  '!hide', '!takedown', '!no-unauthenticated',
])

function isHidden(labels: string[] | undefined): boolean {
  return (labels ?? []).some((label) => HIDDEN_LABELS.has(label))
}

/** Whether a post may appear in public search results. */
export function isSearchablePost(post: AtprotoPostRecord): boolean {
  return !isHidden(post.labels) && !isHidden(post.authorLabels)
}

/** Whether a profile may appear in public search results. */
export function isSearchableActor(actor: AtprotoActorRecord): boolean {
  return !isHidden(actor.labels)
}

function postToHit(post: AtprotoPostRecord): NormalizedHit {
  return {
    id: post.uri,
    // No BM25-comparable relevance score from app.bsky.feed.searchPosts —
    // results already arrive ranked by the PDS's own relevance/recency
    // (per `sort`), so every hit here ties, same fallback the Magento and
    // Directus providers use for the same reason (external system, no exposed
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
      // Picked up automatically by the search layer's ResultCard.vue external-link fallback
      // (no atproto_post entry needed in its ROUTE_BUILDERS map) — see
      // layers/search/app/components/results/ResultCard.vue's `link` computed.
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

/** The "atproto" search provider; `getConfig` is read on every call so
 *  runtime config overrides apply. */
export function createAtprotoSearchProvider(getConfig: () => AtprotoSearchConfig | undefined): SearchProvider {
  return {
    id: 'atproto',

    isEnabled() {
      const config = getConfig()
      return Boolean(config?.enabled && config?.service)
    },

    async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
      const start = Date.now()
      const config = getConfig()!

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
        items.push(...postsResult.value.posts.filter(isSearchablePost).map(postToHit))
      } else {
        console.error('[atprotoProvider] searchPosts failed:', postsResult.reason)
      }
      if (actorsResult.status === 'fulfilled') {
        items.push(...actorsResult.value.actors.filter(isSearchableActor).map(actorToHit))
      } else {
        console.error('[atprotoProvider] searchActors failed:', actorsResult.reason)
      }

      return {
        provider: this.id,
        // atproto's search endpoints don't return a total match count, only
        // a page + cursor — approximated the same way the Directus provider is (this
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
}
