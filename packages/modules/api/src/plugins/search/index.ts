import { definePlugin } from '../definePlugin'
import { loadGraphQLHTTPSubgraph } from '../../loaders/loadGraphQLHTTPSubgraph'

export default definePlugin({
  name: 'search',

  subgraphs: [
    loadGraphQLHTTPSubgraph('Search', {
      endpoint: process.env.MF_SEARCH_ENDPOINT!,
      operationHeaders: {
        Authorization: 'Bearer {context.headers["x-search-token"]}'
      }
    })
  ],

  async extendContext(ctx) {
    return {
      ...ctx,
      searchClient: {
        token: ctx.headers['x-search-token']
      }
    }
  }
})
