
import { getApolloClient } from '../client/apollo'
import { Fetcher, FetcherRequest, FetcherResponse } from './types'

export const GraphQLFetcher: Fetcher = {
  async execute<T = any>(req: FetcherRequest): Promise<FetcherResponse<T>> {
    try {
      const client = getApolloClient()
      const { data } = await client.query({
        query: req.operation,
        variables: req.variables || {}
      })

      return { data: data as T }
    } catch (error) {
      return { error }
    }
  }
}
