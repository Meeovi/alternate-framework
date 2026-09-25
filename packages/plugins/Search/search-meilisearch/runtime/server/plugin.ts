// Nitro plugin: runs at server start, before any /api/search request, so
// the provider is in the registry by the time federate.ts reads it.
import { meilisearchProvider } from './meilisearch'
import { registerSearchProvider } from './register'

export default function registerSearchMeilisearch() {
  registerSearchProvider(meilisearchProvider)
}
