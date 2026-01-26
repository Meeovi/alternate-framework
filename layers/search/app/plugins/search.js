import { defineNuxtPlugin } from '#imports'
import { getSearchClient, getIndexName } from '../utils/search/client'

export default defineNuxtPlugin((nuxtApp) => {
  let searchClient
  let indexName
  try {
    searchClient = getSearchClient()
    indexName = getIndexName()
  } catch (e) {
    // fallback placeholder to avoid build/runtime crash when not configured
    // eslint-disable-next-line no-console
    console.warn('Search client not configured:', e.message || e)
    searchClient = { _client: 'searchkit-fallback' }
    indexName = 'default'
  }

  nuxtApp.provide('searchClient', searchClient)
  nuxtApp.provide('searchIndexName', indexName)
})
