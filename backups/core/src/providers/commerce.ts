import { getApolloClient } from '../client/apollo'
import { GET_PRODUCT, LIST_PRODUCTS } from '../graphql/queries/products'

export const MeeoviApiCommerceProvider = {
  async getProduct(id: string) {
    const client = getApolloClient()
    const { data } = await client.query({
      query: GET_PRODUCT,
      variables: { id }
    })
    return (data as any).product
  },

  async listProducts() {
    const client = getApolloClient()
    const { data } = await client.query({
      query: LIST_PRODUCTS
    })
    return (data as any).products
  }
}
