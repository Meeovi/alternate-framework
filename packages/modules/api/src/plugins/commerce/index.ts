import { definePlugin } from '../definePlugin'
import { loadGraphQLHTTPSubgraph } from '../../loaders/loadGraphQLHTTPSubgraph'

export default definePlugin({
  name: 'commerce',

  subgraphs: [
    loadGraphQLHTTPSubgraph('Commerce', {
      endpoint: process.env.MF_COMMERCE_ENDPOINT!,
      operationHeaders: {
        Authorization: 'Bearer {context.headers["x-commerce-token"]}'
      }
    })
  ],

  async extendContext(ctx) {
    return {
      ...ctx,
      cart: ctx.cookies['mf-cart-id'] || null
    }
  }
})
