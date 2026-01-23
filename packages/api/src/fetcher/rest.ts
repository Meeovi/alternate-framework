
import { Fetcher, FetcherRequest, FetcherResponse } from './types'

export const RestFetcher: Fetcher = {
  async execute<T = any>(req: FetcherRequest): Promise<FetcherResponse<T>> {
    try {
      const res = await fetch(req.operation, {
        method: req.options?.method || 'GET',
        headers: req.options?.headers,
        body: req.options?.body ? JSON.stringify(req.options.body) : undefined
      })

      const data = await res.json()
      return { data }
    } catch (error) {
      return { error }
    }
  }
}
