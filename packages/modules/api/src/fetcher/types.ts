
export interface FetcherRequest {
  operation: any
  variables?: Record<string, any>
  options?: Record<string, any>
}

export interface FetcherResponse<T = any> {
  data?: T
  error?: any
}

export interface Fetcher {
  execute<T = any>(req: FetcherRequest): Promise<FetcherResponse<T>>
}
