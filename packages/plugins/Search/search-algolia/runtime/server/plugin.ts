// Nitro plugin: runs at server start, before any /api/search request, so
// the provider is in the registry by the time federate.ts reads it.
import { algoliaProvider } from './algolia'
import { registerSearchProvider } from './register'

export default function registerSearchAlgolia() {
  registerSearchProvider(algoliaProvider)
}
