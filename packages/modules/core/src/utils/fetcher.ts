
import { getFetcher } from '../fetcher/registry'
import { FetcherRequest, FetcherResponse } from '../fetcher/types'

export async function fetcher<T = any>(
  operation: string,
  variables?: Record<string, any>,
  options?: Record<string, any>
): Promise<FetcherResponse<T>> {
  const activeFetcher = getFetcher()

  return activeFetcher.execute<T>({
    operation,
    variables,
    options
  })
}
