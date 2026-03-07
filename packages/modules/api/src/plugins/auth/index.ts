import { definePlugin } from '../definePlugin'
import { loadGraphQLHTTPSubgraph } from '../../loaders/loadGraphQLHTTPSubgraph'

export default definePlugin({
  name: 'auth',

  subgraphs: [
    loadGraphQLHTTPSubgraph('Auth', {
      endpoint: process.env.MF_AUTH_ENDPOINT!,
      operationHeaders: {
        Authorization: 'Bearer {context.headers["x-auth-token"]}'
      }
    })
  ],

  async extendContext(ctx) {
    const token = ctx.headers['x-auth-token']
    return {
      ...ctx,
      user: token ? { token } : null
    }
  }
})
