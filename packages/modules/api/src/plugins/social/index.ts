import { definePlugin } from '../definePlugin'
import { loadGraphQLHTTPSubgraph } from '../../loaders/loadGraphQLHTTPSubgraph'

export default definePlugin({
  name: 'social',

  subgraphs: [
    loadGraphQLHTTPSubgraph('Social', {
      endpoint: process.env.MF_SOCIAL_ENDPOINT!,
      operationHeaders: {
        Authorization: 'Bearer {context.headers["x-social-token"]}'
      }
    })
  ],

  async extendContext(ctx) {
    return {
      ...ctx,
      social: {
        token: ctx.headers['x-social-token']
      }
    }
  }
})
