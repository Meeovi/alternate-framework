// layers/search/utils/client.ts
// Fully robust Searchkit InstantSearch client loader for Nuxt 3/4

import type { SearchClient } from 'instantsearch.js'
import { getEnv } from '../env'

export function getIndexName(): string {
  return (
    process.env.NUXT_PUBLIC_SEARCH_INDEX ||
    process.env.SEARCH_INDEX ||
    'default'
  )
}

function buildHostFromParts(): string | null {
  const explicit = getEnv('SEARCHKIT_HOST')
  if (explicit) return explicit

  const protocol = (getEnv('SEARCHKIT_PROTOCOL') || 'http').replace(/:\/\//, '')
  const hostname = getEnv('SEARCHKIT_HOSTNAME')
  const port = getEnv('SEARCHKIT_PORT')

  if (!hostname) return null

  return `${protocol}://${hostname}${port ? `:${port}` : ''}`
}

export function getSearchClient(): SearchClient {
  const host = buildHostFromParts()

  if (!host) {
    console.warn('[search] Searchkit host not configured — returning fallback client')
    return createFallbackClient()
  }

  let mod: any
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('@searchkit/instantsearch-client')
  } catch (err) {
    console.warn('[search] @searchkit/instantsearch-client not installed or failed to load — returning fallback client', err?.message || err)
    return createFallbackClient()
  }

  // Normalize all possible export shapes (ESM, CJS, wrapped)
  const candidate =
    mod?.default?.default ||
    mod?.default?.createClient ||
    mod?.default ||
    mod?.createClient ||
    mod

  if (typeof candidate !== 'function') {
    console.warn('[search] createClient not found in @searchkit/instantsearch-client export — returning fallback client')
    return createFallbackClient()
  }

  try {
    const opts: any = { host }
    const apiKey = getEnv('SEARCHKIT_API_KEY')
    if (apiKey) opts.apiKey = apiKey

    return candidate(opts)
  } catch (e: any) {
    console.warn('[search] Failed to create Searchkit client — returning fallback client:', e?.message || e)
    return createFallbackClient()
  }
}

function createFallbackClient(): SearchClient {
  return {
    search(requests: any) {
      const results = requests.map(() => ({
        hits: [],
        nbHits: 0,
        processingTimeMS: 0,
        page: 0,
        hitsPerPage: 0
      }))
      return Promise.resolve(results)
    }
  } as unknown as SearchClient
}
