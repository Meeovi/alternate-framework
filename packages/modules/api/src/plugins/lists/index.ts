import { definePlugin } from '../definePlugin'
import { loadGraphQLHTTPSubgraph } from '../../loaders/loadGraphQLHTTPSubgraph'

export default definePlugin({
  name: 'lists',

  subgraphs: [
    loadGraphQLHTTPSubgraph('Lists', {
      endpoint: process.env.MF_LISTS_ENDPOINT!,
      operationHeaders: {
        Authorization: 'Bearer {context.headers["x-lists-token"]}'
      }
    })
  ],

  async extendContext(ctx) {
    return {
      ...ctx,
      lists: {
        token: ctx.headers['x-lists-token']
      }
    }
  }
})
