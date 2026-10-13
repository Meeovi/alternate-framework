// Shared types for @mframework/meeovi-integrations.

export interface MeeoviIntegrationsModuleOptions {
  /** API route prefix. Default '/api/integrations'. */
  apiBase?: string
  /** Session endpoint used to identify the user (better-auth by default). */
  sessionEndpoint?: string
  /** Directus collection holding the integration catalog. Default 'integrations'. */
  catalogCollection?: string
  /** Directus collection holding per-user installs. Default 'integration_installs'. */
  installsCollection?: string
  /** Where a page guarded by the `integration` middleware sends users who
   *  haven't installed its integration. Default '/workspace/dashboard/integrations'. */
  catalogPath?: string
  /** Full URL of the integrations catalog, for apps that link to it in
   *  another app (e.g. the storefront → Meeovi Workspace). Also settable
   *  with NUXT_PUBLIC_MEEOVI_INTEGRATIONS_CATALOG_URL. */
  catalogUrl?: string
  /** Directus connection. Server-only. */
  directus?: {
    url?: string
    token?: string
  }
}

/**
 * Where an integration stands for the current user:
 * - installed: on for this user
 * - available: free, has a plugin — can be installed
 * - paid: needs billing, not installable yet
 * - coming-soon: no plugin yet / not published
 */
export type IntegrationState = 'installed' | 'available' | 'paid' | 'coming-soon'

export interface IntegrationCatalogItem {
  id: number
  name: string
  description: string | null
  type: string | null
  developer: string | null
  version: string | null
  /** 'free' | 'paid' | null */
  cost: string | null
  price: number | null
  /** Plugin package the integration switches on, e.g. '@mframework/list-type-kanban'. */
  plugin: string | null
  state: IntegrationState
  installedAt: string | null
}

/** GET {apiBase} */
export interface IntegrationCatalogResponse {
  signedIn: boolean
  items: IntegrationCatalogItem[]
}

/** GET {apiBase}/installed */
export interface InstalledIntegrationsResponse {
  /** Plugin packages switched on for the signed-in user. */
  plugins: string[]
  /** Catalog ids installed by the signed-in user. */
  integrations: number[]
}

export interface MeeoviIntegrationsPublicConfig {
  apiBase: string
  catalogPath: string
  catalogUrl: string
}
