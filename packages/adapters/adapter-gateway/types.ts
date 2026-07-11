export type APIResponse<T> = {
  data: T | null
  status: number
  error?: string
}

export type APISource = {
  name: string
  type: string
  endpoint: string
  headers?: Record<string, string>
  secret?: string
}

export type GatewaySourceConfig = {
  enabled?: boolean
  sources: APISource[]
}

export type APIEndpoint = {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  source?: string
  operationName?: string
}

export type NormalizedEndpoint = {
  id: string
  name: string
  path: string
  method: string
  sourceName: string
}

export type NormalizedSource = {
  id: string
  name: string
  type: string
  endpoint: string
}

export type NormalizedService = {
  id: string
  name: string
  endpoints: NormalizedEndpoint[]
  sources: NormalizedSource[]
}

export type Result<T> = {
  ok: true
  data: T
} | {
  ok: false
  error: string
}

export type MongooseSource = {
  name: string
  type: 'mongoose'
  endpoint: string
  headers?: Record<string, any>
}

export type MySQLSource = {
  name: string
  type: 'mysql' | 'mariadb'
  endpoint: string
  headers?: Record<string, any>
}

export type PostGraphileSource = {
  name: string
  type: 'postgraphile'
  endpoint: string
  headers?: Record<string, any>
}

export type SubscriptionSource = {
  name: string
  type: 'subscription'
  endpoint: string
  headers?: Record<string, string>
}

export type WebhookSource = {
  name: string
  type: 'webhook'
  endpoint: string
  secret?: string
  headers?: Record<string, string>
}

export type SourceType = 'rest' | 'graphql' | 'openapi' | 'swagger' | 'grpc' | 'mongoose' | 'mysql' | 'mariadb' | 'postgraphile' | 'subscription' | 'webhook'

export type SecurityConfig = {
  apiKey?: string
  jwtSecret?: string
  corsOrigin?: string
}

export type RateLimitConfig = {
  maxRequests?: number
  windowMs?: number
}

export type CacheConfig = {
  ttl?: number
  maxSize?: number
}

export type HiveConfig = {
  token?: string
  endpoint?: string
}