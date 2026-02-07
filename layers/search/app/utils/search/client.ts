// Lightweight helper to obtain a search client and index name for InstantSearch
// This version NEVER throws — it returns null when search is not configured.

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

export function getSearchClient(): SearchClient | null {
  const host = buildHostFromParts()
  if (!host) {
    console.warn('[search] Searchkit host not configured — search disabled')
    return null
  }

  let createClient: any
  try {
    createClient = require('@searchkit/instantsearch-client')
  } catch {
    console.warn('[search] @searchkit/instantsearch-client not installed — search disabled')
    return null
  }

  try {
    const opts: any = { host }
    const apiKey = getEnv('SEARCHKIT_API_KEY')
    if (apiKey) opts.apiKey = apiKey

    return createClient(opts)
  } catch (e: any) {
    console.warn('[search] Failed to create Searchkit client:', e?.message || e)
    return null
  }
}