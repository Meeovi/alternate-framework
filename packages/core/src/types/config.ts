export interface AlternateConfig {
  env: 'development' | 'production' | 'test'
  appName?: string
  logger?: {
    level?: 'debug' | 'info' | 'warn' | 'error'
  }
  // Extension point for modules
  [key: string]: unknown
}