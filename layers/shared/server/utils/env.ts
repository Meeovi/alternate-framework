/**
 * Runtime Environment Resolver
 * 
 * Exposes environment configuration for Mesh and adapter selection.
 * Allows switching backends instantly via NODE_ENV and MESH_ADAPTER.
 */

export interface RuntimeConfig {
  env: 'local' | 'staging' | 'production';
  adapter: 'graphql-backend' | 'rest-backend' | 'magento';
}

/**
 * Get runtime configuration from environment variables
 */
export function getRuntimeConfig(): RuntimeConfig {
  return {
    env: (process.env.NODE_ENV || 'local') as RuntimeConfig['env'],
    adapter: (process.env.MESH_ADAPTER || 'graphql-backend') as RuntimeConfig['adapter']
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getRuntimeConfig().env === 'production';
}

/**
 * Check if running in staging
 */
export function isStaging(): boolean {
  return getRuntimeConfig().env === 'staging';
}

/**
 * Check if running in local/development
 */
export function isDevelopment(): boolean {
  return getRuntimeConfig().env === 'local';
}

/**
 * Get adapter from environment or default
 */
export function getActiveAdapter(): RuntimeConfig['adapter'] {
  return getRuntimeConfig().adapter;
}
