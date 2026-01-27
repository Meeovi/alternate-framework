// Lightweight helper to obtain a search client and index name for InstantSearch
// This is intentionally minimal — it throws when no configuration is present
// so the caller can fall back gracefully.
import type { SearchClient } from 'instantsearch.js'

export function getIndexName(): string {
  return (
    process.env.NUXT_PUBLIC_SEARCH_INDEX ||
    process.env.SEARCH_INDEX ||
    'default'
  )
}

export function getSearchClient(): SearchClient {
  const host = process.env.NUXT_PUBLIC_SEARCHKIT_HOST || process.env.SEARCHKIT_HOST
  if (!host) {
    throw new Error('Searchkit host not configured via SEARCHKIT_HOST or NUXT_PUBLIC_SEARCHKIT_HOST')
  }

  // Defer importing heavy searchkit/instantsearch client until runtime.
  // Consumers can replace this implementation with a provider-specific client.
  // Here we attempt to use @searchkit/instantsearch-client if available.
  // If not present, let the import fail so the plugin can fallback.
  // The actual creation API differs between versions; adjust as needed.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const createClient = require('@searchkit/instantsearch-client')
  if (!createClient) {
    throw new Error('@searchkit/instantsearch-client is not installed')
  }

  // Create a minimal client. The factory API may vary; this is a best-effort
  // placeholder that should be adapted to your Searchkit configuration.
  // If your Searchkit installation exposes a helper, prefer using that.
  try {
    return createClient({ host })
  } catch (e: any) {
    // rethrow with context
    throw new Error('Failed to create Searchkit client: ' + (e?.message || e))
  }
}
