import type { MFrameworkGatewayConfig } from './types'

export function defineGatewayConfig(
  config: MFrameworkGatewayConfig
): MFrameworkGatewayConfig {
  return {
    introspection: process.env.NODE_ENV !== 'production',
    cache: 'memory',
    tracing: false,
    playground: process.env.NODE_ENV !== 'production',
    ...config
  }
}
