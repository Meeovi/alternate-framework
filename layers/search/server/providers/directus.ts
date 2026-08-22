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

type DirectusRuntimeConfig = {
  url?: string
  auth?: { token?: string }
}

// Each entry names a real, confirmed-existing Directus collection (checked
// against layers/auth/server/database/migrations/schema.ts, the live schema
// of record) and how to turn one of its rows into a search hit. `title`/
// `image` read straight off the row; `type` is the normalized value
// ResultCard.vue's ROUTE_BUILDERS map keys off of to build the right
// /connect/space/{slug}, /connect/post/{slug}, /outlet/{slug} link — getting
// this wrong is exactly the class of bug that made every non-product result
// link nowhere. `hashtags` was deliberately left out: no such table exists
// in the schema, so querying it would just 400 on every request.
const SEARCHABLE_COLLECTIONS: Array<{
  collection: string
  type: string
  titleField: string
  descriptionField: string
  imageField: string
}> = [
  { collection: 'spaces', type: 'space', titleField: 'name', descriptionField: 'description', imageField: 'image' },
  { collection: 'posts', type: 'post', titleField: 'title', descriptionField: 'content', imageField: 'image' },
  { collection: 'shops', type: 'shop', titleField: 'name', descriptionField: 'description', imageField: 'image' },
]

function getConfig(): DirectusRuntimeConfig {
  const config = useRuntimeConfig()
  return (config.public as any)?.directus ?? {}
}

// ReturnType<typeof createDirectus> alone is only the bare client, before
// .with(rest())/.with(staticToken()) add their methods (request, etc.) —
// annotating _client with that narrower type stripped them back off on
// assignment. Inferring from the chain itself keeps them.
function buildClient(url: string, token: string) {
  return createDirectus(url).with(rest()).with(staticToken(token))
}

let _client: ReturnType<typeof buildClient> | null = null

function getClient(url: string, token: string) {
  if (_client) return _client
  _client = buildClient(url, token)
  return _client
}

export const directusProvider: SearchProvider = {
  id: 'directus',

  isEnabled() {
    const config = getConfig()
    return Boolean(config.url && config.auth?.token)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const client = getClient(config.url!, config.auth!.token!)

    const perCollectionLimit = options.pageSize
    // Directus paginates each collection independently by design here —
    // federate.ts already re-derives global ordering itself, this only
    // needs to hand back up to `page * pageSize` items total per provider,
    // same contract every other provider follows.
    const offset = Math.max(0, (options.page - 1) * options.pageSize)

    const results = await Promise.allSettled(
      SEARCHABLE_COLLECTIONS.map(async (entry) => {
        // client.request() unwraps the typed readItems() command to a plain
        // array — Directus's `meta` envelope (filter_count etc.) isn't
        // reachable through this typed path, so total is approximated as
        // this page's item count, same as every other provider does beyond
        // its own exact-count capability (see federate.ts's own note on
        // approximate federated totals being the standard tradeoff here).
        const items = await client.request<any[]>(
          readItems(entry.collection as any, {
            search: options.query || undefined,
            // The "published" status value isn't consistent across
            // collections or even within one — spaces has both "Public" and
            // "public", posts uses "Public", shops uses "published".
            // Denying known not-visible statuses (case-insensitively,
            // hence the duplicated casing) is robust to that drift; an
            // exact `_eq: 'published'` silently returned zero results for
            // every collection except shops.
            filter: { status: { _nin: ['draft', 'Draft', 'private', 'Private', 'archived', 'Archived', 'hidden', 'Hidden'] } },
            fields: ['id', 'slug', entry.titleField, entry.descriptionField, entry.imageField],
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
          // No native relevance score from Directus's `search` param —
          // every match within a collection ranks equally, same fallback
          // magento.ts uses for the same reason (external system, no BM25).
          score: 1,
          source: {
            type: entry.type,
            title: row[entry.titleField] ?? null,
            name: row[entry.titleField] ?? null,
            slug: row.slug ?? null,
            description: row[entry.descriptionField] ?? null,
            image: row[entry.imageField] ?? null,
          },
        })
      }
    }

    return {
      provider: this.id,
      items,
      total,
      facets: {},
      tookMs: Date.now() - start,
    }
  },
}
