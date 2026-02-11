import type { SearchClient } from 'instantsearch.js'

export function getSearchClient(): SearchClient | null {
  let mod: any
  try {
    mod = require('@searchkit/instantsearch-client')
  } catch {
    console.warn('[mframework-ui] Searchkit client missing')
    return null
  }

  const candidate =
    mod?.default?.default ||
    mod?.default?.createClient ||
    mod?.default ||
    mod?.createClient ||
    mod

  if (typeof candidate !== 'function') return null

  const host = process.env.NUXT_PUBLIC_SEARCHKIT_HOST
  if (!host) return null

  return candidate({ host })
}