// server/providers/directus.ts
//
// Federates Directus CMS content (spaces, posts, shops, ...) into the shared
// SearchProvider contract, following the same shape as magento.ts (a live
// query against an external system, not a synced index). Every other
// provider here (opensearch/postgres/mysql/database) only ever searches
// whatever's been separately synced into that backend's own storage, which
// in this app is products alone — CMS collections like `spaces` were never
// reachable from search at all. This queries Directus directly at request
// time via its own built-in `search` full-text parameter, so no separate
// sync/indexing pipeline is needed.
import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { useRuntimeConfig } from '#imports'
import type { NormalizedHit, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

// One searchable Directus collection and how a row becomes a hit. `type` is
// what ResultCard.vue's ROUTE_BUILDERS keys off of (space/post/shop/...);
// `path` (e.g. '/characters/{slug}') overrides that with an explicit link,
// for apps whose content types ResultCard doesn't know.
export type DirectusSearchCollection = {
  collection: string
  type: string
  titleField: string
  descriptionField?: string
  imageField?: string
  /** default 'slug'; null when the collection has none */
  slugField?: string | null
  /** default 'status'; null when the collection has no status field */
  statusField?: string | null
  /** link template — {slug} and {id} are replaced from the row */
  path?: string
}

type DirectusProviderConfig = {
  enabled?: boolean
  collections?: DirectusSearchCollection[]
}

// Meeovi's collections, used when the app doesn't list its own. Each entry
// names a real, confirmed-existing Directus collection (checked against
// layers/auth/server/database/migrations/schema.ts, the live schema of
// record). `hashtags` was deliberately left out: no such table exists in the
// schema, so querying it would just 400 on every request.
const DEFAULT_COLLECTIONS: DirectusSearchCollection[] = [
  { collection: 'spaces', type: 'space', titleField: 'name', descriptionField: 'description', imageField: 'image' },
  { collection: 'posts', type: 'post', titleField: 'title', descriptionField: 'content', imageField: 'image' },
  { collection: 'shops', type: 'shop', titleField: 'name', descriptionField: 'description', imageField: 'image' },
]

// The "published" status value isn't consistent across collections or even
// within one — spaces has both "Public" and "public", posts uses "Public",
// shops uses "published". Denying known not-visible statuses
// (case-insensitively, hence the duplicated casing) is robust to that drift;
// an exact `_eq: 'published'` silently returned zero results for every
// collection except shops. The soft-delete / trash statuses must stay in
// this list so a removed row drops out of search on the very next query
// (there's no separate sync/index to purge — this queries Directus live).
const HIDDEN_STATUSES = [
  'draft', 'Draft',
  'private', 'Private',
  'archived', 'Archived',
  'hidden', 'Hidden',
  'deleted', 'Deleted',
  'trashed', 'Trashed',
  'removed', 'Removed',
  'suspended', 'Suspended',
  'banned', 'Banned',
]

function getConfig() {
  const config = useRuntimeConfig()
  const provider = ((config as any).searchProviders?.directus ?? {}) as DirectusProviderConfig
  return {
    enabled: Boolean(provider.enabled),
    url: ((config.public as any)?.directus?.url as string | undefined) || '',
    // Server-only token (runtimeConfig.directus.token, set by
    // layers/commerce). Optional: without one, Directus is queried as its
    // public role — enough for sites that read Directus anonymously.
    token: ((config as any).directus?.token as string | undefined) || '',
    collections: provider.collections?.length ? provider.collections : DEFAULT_COLLECTIONS,
  }
}

// ReturnType<typeof createDirectus> alone is only the bare client, before
// .with(rest())/.with(staticToken()) add their methods (request, etc.) —
// inferring from the chain itself keeps them.
function buildClient(url: string, token: string) {
  const client = createDirectus(url).with(rest())
  return token ? client.with(staticToken(token)) : client
}

let _client: ReturnType<typeof buildClient> | null = null
let _clientKey = ''

function getClient(url: string, token: string) {
  const key = `${url}|${token}`
  if (_client && _clientKey === key) return _client
  _client = buildClient(url, token)
  _clientKey = key
  return _client
}

// Directus's `search` param has no relevance score, so rank on the title:
// exact match > starts with > contains > matched only in other text.
function titleScore(title: unknown, query: string) {
  const t = String(title ?? '').toLowerCase().trim()
  const q = query.toLowerCase().trim()
  if (!q || !t) return 1
  if (t === q) return 4
  if (t.startsWith(q)) return 3
  if (t.includes(q)) return 2
  return 1
}

function buildPath(template: string | undefined, row: Record<string, any>, slugField: string | null) {
  if (!template) return null
  const slug = slugField ? row[slugField] : null
  if (template.includes('{slug}') && !slug) return null
  return template
    .replace('{slug}', encodeURIComponent(String(slug ?? '')))
    .replace('{id}', encodeURIComponent(String(row.id ?? '')))
}

export const directusProvider: SearchProvider = {
  id: 'directus',

  // Off unless the app enables it (searchProviders.directus.enabled) —
  // a token alone no longer turns it on, since apps' Directus content and
  // collections differ.
  isEnabled() {
    const config = getConfig()
    return config.enabled && Boolean(config.url)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const client = getClient(config.url, config.token)

    const perCollectionLimit = options.pageSize
    // Directus paginates each collection independently by design here —
    // federate.ts already re-derives global ordering itself, this only
    // needs to hand back up to `page * pageSize` items total per provider,
    // same contract every other provider follows.
    const offset = Math.max(0, (options.page - 1) * options.pageSize)

    const results = await Promise.allSettled(
      config.collections.map(async (entry) => {
        // client.request() unwraps the typed readItems() command to a plain
        // array — Directus's `meta` envelope (filter_count etc.) isn't
        // reachable through this typed path, so total is approximated as
        // this page's item count, same as every other provider does beyond
        // its own exact-count capability (see federate.ts's own note on
        // approximate federated totals being the standard tradeoff here).
        const slugField = entry.slugField === undefined ? 'slug' : entry.slugField
        const statusField = entry.statusField === undefined ? 'status' : entry.statusField
        const fields = ['id', slugField, entry.titleField, entry.descriptionField, entry.imageField]
          .filter((field): field is string => Boolean(field))
        const items = await client.request<any[]>(
          readItems(entry.collection as any, {
            search: options.query || undefined,
            ...(statusField ? { filter: { [statusField]: { _nin: HIDDEN_STATUSES } } } : {}),
            fields,
            limit: perCollectionLimit,
            offset,
          } as any),
        )
        return { entry, items: items ?? [] }
      }),
    )

    const items: NormalizedHit[] = []
    let total = 0

    for (const outcome of results) {
      if (outcome.status !== 'fulfilled') {
        console.error('[directusProvider] collection search failed:', outcome.reason)
        continue
      }
      const { entry, items: rows } = outcome.value
      total += rows.length

      for (const row of rows) {
        items.push({
          id: `${entry.collection}:${row.id}`,
          score: titleScore(row[entry.titleField], options.query),
          source: {
            type: entry.type,
            title: row[entry.titleField] ?? null,
            name: row[entry.titleField] ?? null,
            slug: (entry.slugField === null ? null : row[entry.slugField ?? 'slug']) ?? null,
            description: entry.descriptionField ? row[entry.descriptionField] ?? null : null,
            image: entry.imageField ? row[entry.imageField] ?? null : null,
            path: buildPath(entry.path, row, entry.slugField === undefined ? 'slug' : entry.slugField),
          },
        })
      }
    }

    // Rank across collections by title match. Stable, so equal scores keep
    // the configured collection order (federate.ts keeps a single
    // provider's order as-is).
    items.sort((a, b) => b.score - a.score)

    return {
      provider: this.id,
      items,
      total,
      facets: {},
      tookMs: Date.now() - start,
    }
  },
}
