// Shared types for @mframework/meeovi-integrations.

export interface MeeoviIntegrationsModuleOptions {
  /** API route prefix. Default '/api/integrations'. */
  apiBase?: string
  /** Session endpoint used to identify the user (better-auth by default). */
  sessionEndpoint?: string
  /** Directus collection holding per-user installs. Default 'integration_installs'. */
  installsCollection?: string
  /** Folder scanned at build time for installable plugins
   *  (`<pluginsDir>/<Category>/<plugin>/package.json`). Default: the nearest
   *  `packages/plugins` above the app. */
  pluginsDir?: string
  /** The integrations page (list at this path, a plugin at `<path>/<slug>`),
   *  where the `integration` middleware sends users who haven't installed a
   *  plugin. Default '/workspace/integration'. */
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
  /** Only sandboxed plugins can be installed by users. Admin plugins (first-
   *  party infrastructure, managed by admins) are exempt. Default true. */
  requireSandbox?: boolean
  /** Route prefix sandboxed plugin UIs are served under. Default '/integration-sandbox'. */
  sandboxBase?: string
}

/**
 * What a plugin declares to be installable, in its package.json:
 *
 *   "mframework": {
 *     "integration": {
 *       "name": "Kanban board",
 *       "description": "Show any list as a board.",
 *       "category": "Productivity",
 *       "icon": "fas fa-table-columns",
 *       "admin": false
 *     }
 *   }
 *
 * Plugins without it aren't listed (core features and infrastructure).
 * `admin: true`, or living in the plugins folder's `Admin/` category, makes
 * the plugin visible to — and installable by — signed-in admins only.
 *
 * Sandboxing:
 *   "sandbox": "sandbox/index.html"    the plugin's UI, run in a sandboxed
 *                                       iframe (everything in that folder is
 *                                       served; nothing else)
 *   "hosts": ["api.example.com"]       the only outside hosts it may reach
 *                                       (exact names or "*.example.com");
 *                                       none by default
 *
 * Selling:
 *   "sku": "ACME-KANBAN"               the product in the commerce backend
 *                                       (Magento, via adapter-magento) that
 *                                       sells it; free if its price is 0
 */
export interface IntegrationManifest {
  name?: string
  description?: string
  category?: string
  icon?: string
  admin?: boolean
  sandbox?: string
  hosts?: string[]
  /** The store product (SKU, in the commerce backend) that sells it. The
   *  manifest is the trust anchor: only this SKU counts, so another seller
   *  can't list someone else's plugin. Its price there decides free or paid. */
  sku?: string
}

/** A discovered plugin (build time). */
export interface IntegrationPlugin {
  /** Package name, e.g. '@mframework/list-type-kanban'. */
  plugin: string
  /** URL slug: the package name without its scope, e.g. 'list-type-kanban'. */
  slug: string
  name: string
  description: string | null
  category: string | null
  icon: string | null
  developer: string | null
  version: string | null
  admin: boolean
  /** Registered in this app's build — otherwise it can't be switched on here. */
  inBuild: boolean
  /** The sandboxed UI: its folder (absolute, build time) and entry file in it. */
  sandbox: { dir: string, entry: string } | null
  /** Outside hosts it may reach (exact or "*.domain"). */
  hosts: string[]
  /** Store SKU that sells it, if it's sold (see IntegrationManifest.sku). */
  sku: string | null
}

/**
 * Where an integration stands for the current user:
 * - installed: on for this user
 * - available: can be installed
 * - paid: sold in the store and not bought by this user yet
 * - coming-soon: a plugin this app can't run yet (not in the app, not
 *   sandboxed), or one whose store product doesn't exist yet
 */
export type IntegrationState = 'installed' | 'available' | 'paid' | 'coming-soon'

export interface IntegrationCatalogItem {
  /** Stable id for the page URL: the plugin slug, or `product-<id>` for a
   *  store product naming a plugin this app doesn't have. */
  slug: string
  name: string
  description: string | null
  category: string | null
  icon: string | null
  developer: string | null
  version: string | null
  /** 'free' | 'paid' | null */
  cost: string | null
  /** Price when paid, otherwise null. */
  price: number | null
  /** The store SKU that sells it, if it's sold. */
  sku: string | null
  /** The app's product key for it (`/product/<productRef>`, cart), once
   *  the store has the product. */
  productRef: string | null
  /** Paid, and this user bought it (or is the seller). */
  purchased: boolean
  /** Plugin package the integration switches on, e.g. '@mframework/list-type-kanban'. */
  plugin: string | null
  /** Admin-only plugin (only admins ever see these). */
  admin: boolean
  /** Runs in the sandbox (isolated iframe, no outside access beyond `hosts`). */
  sandboxed: boolean
  /** Outside hosts it is allowed to reach. Empty: none. */
  hosts: string[]
  state: IntegrationState
  /** Why it can't be installed, when state is 'coming-soon'. */
  reason: 'not-in-app' | 'not-sandboxed' | 'not-in-store' | null
  installedAt: string | null
}

/** GET {apiBase} */
export interface IntegrationCatalogResponse {
  signedIn: boolean
  admin: boolean
  items: IntegrationCatalogItem[]
}

/** GET {apiBase}/:slug */
export interface IntegrationDetailResponse {
  signedIn: boolean
  item: IntegrationCatalogItem
}

/** GET {apiBase}/installed */
export interface InstalledIntegrationsResponse {
  /** Plugin packages switched on for the signed-in user. */
  plugins: string[]
}

/** GET|PUT|PATCH {apiBase}/:slug/data — this user's data for one plugin. */
export interface IntegrationDataResponse {
  plugin: string
  data: Record<string, unknown>
}

export interface MeeoviIntegrationsPublicConfig {
  apiBase: string
  catalogPath: string
  catalogUrl: string
  /** Where sandboxed plugin UIs are served: `<sandboxBase>/<slug>/`. */
  sandboxBase: string
}

/**
 * The commerce backend that sells integrations, registered on the server
 * under `Symbol.for('mframework.integrations.store')` (adapter-magento
 * does; any adapter can). Without one, plugins that name a SKU can't be
 * installed and the rest are free.
 */
export interface IntegrationStore {
  id: string
  /** Products for these SKUs that the store sells (missing ones left out). */
  products(skus: string[]): Promise<IntegrationStoreProduct[]>
  /** The signed-in user's customer id in the store, from their session user. */
  customerId(user: Record<string, unknown>): string | null
  /** SKUs the customer has paid for (not refunded). Throws when it can't tell. */
  purchasedSkus(customerId: string): Promise<string[]>
}

export interface IntegrationStoreProduct {
  sku: string
  /** The app's product key (`/product/<ref>`, cart lines). */
  ref: string
  name: string
  description: string | null
  price: number
  currency: string | null
  image: string | null
  /** The marketplace seller (developer) selling it. */
  seller: { id: string, name: string | null } | null
}

/**
 * Host-side handlers a page lends to an embedded integration, e.g. the
 * lists page lends `list.items` / `list.update` for the list being shown.
 * The page enforces what each may touch; the sandbox only gets results.
 */
export type IntegrationCapabilities = Record<string, (params: unknown) => unknown | Promise<unknown>>
