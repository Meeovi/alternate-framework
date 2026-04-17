export interface MApiClientOptions {
  endpoint: string
  headers?: () => Record<string, string>
}

export interface MApiClient {
  query<T = any>(query: string, variables?: Record<string, any>): Promise<T>
  mutate<T = any>(query: string, variables?: Record<string, any>): Promise<T>
}

export interface GraphqlErrorLike {
  message?: string
  [key: string]: unknown
}

export interface GraphqlRequestOptions {
  variables?: Record<string, unknown>
  headers?: Record<string, string>
  credentials?: RequestCredentials
}

export interface RestRequestOptions {
  method?: string
  query?: Record<string, unknown>
  headers?: Record<string, string>
  body?: unknown
  credentials?: RequestCredentials
  baseUrl?: string
}

export interface GraphqlRestTransportOptions {
  graphqlEndpoint: string
  restEndpoint?: string
  internalBase?: string
  timeoutMs?: number
  headers?: () => Record<string, string>
  fetchImpl?: typeof fetch
  unsupportedGraphqlPatterns?: RegExp[]
}

export interface GraphqlRestTransport {
  graphql<T = any>(query: string, requestOptions?: GraphqlRequestOptions): Promise<T>
  rest<T = any>(path: string, requestOptions?: RestRequestOptions): Promise<T>
  internal<T = any>(path: string, requestOptions?: Omit<RestRequestOptions, 'baseUrl'>): Promise<T>
  withGraphqlFallback<T>(graphqlExecutor: () => Promise<T>, restExecutor: () => Promise<T>): Promise<T>
}
