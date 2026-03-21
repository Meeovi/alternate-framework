export interface MApiClientOptions {
  endpoint: string
  headers?: () => Record<string, string>
}

export interface MApiClient {
  query<T = any>(query: string, variables?: Record<string, any>): Promise<T>
  mutate<T = any>(query: string, variables?: Record<string, any>): Promise<T>
}
