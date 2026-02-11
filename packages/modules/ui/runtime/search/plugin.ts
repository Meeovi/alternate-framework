import { getSearchClient } from './client'

export default (nuxtApp: any) => {
  const client = getSearchClient()
  const indexName = process.env.NUXT_PUBLIC_SEARCH_INDEX || 'default'

  nuxtApp.provide('mSearchClient', client)
  nuxtApp.provide('mSearchIndex', indexName)
}