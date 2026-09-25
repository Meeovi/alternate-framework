// Note: this is a distinct registry from CommerceDriverRegistry (commerce.ts).
// CommerceDriverRegistry's CommerceDriverContract is a generic, normalized
// commerce interface (getProduct(): Promise<Product|null>, etc.) with zero
// registered implementations anywhere in the repo. CommerceBackendRegistry
// exists to solve a narrower, concrete problem: layers/commerce's pages and
// components are hardcoded against Directus's REST/query shape (collection
// name + Directus-style filter/fields params), and adapters that want to
// back those same call sites need to speak that exact shape, not a generic
// product model.
export type DirectusRequestDescriptor = {
  method: 'GET'
  collection: string
  key?: string | number
  params?: Record<string, any>
}

export type CategoryProductsRef = {
  /** Directus department/category slug — always provided, the default lookup key. */
  slug: string
  /** Backend-native category id already stored on the Directus record
   *  (departments.relative_id / categories.uid), when populated. Adapters
   *  MUST prefer this over resolving by slug when present — skips a lookup
   *  round trip and isn't subject to slug drift between the CMS and the
   *  backend catalog. */
  externalId?: string
}

export interface CommerceBackendAdapter {
  readonly id: string
  readonly collections: string[]
  isEnabled(): boolean
  /** Must return Directus-shaped data, already unwrapped (no {data:...} envelope). */
  request(descriptor: DirectusRequestDescriptor): Promise<any>
  /**
   * Products belonging to the department/category identified by `ref`,
   * normalized to this adapter's Directus-shaped product output. Optional
   * and deliberately separate from `request()`'s generic collection
   * passthrough: "departments" is a Directus-only CMS concept no other
   * backend needs to understand — this takes an explicit category
   * reference instead of a Directus collection name. Adapters with no
   * category concept simply omit it; callers must feature-detect with
   * `typeof adapter.getProductsByCategory === 'function'`.
   */
  getProductsByCategory?(ref: CategoryProductsRef): Promise<any[]>
}

const registry = new Map<string, CommerceBackendAdapter>()

export function registerCommerceBackendAdapter(adapter: CommerceBackendAdapter): void {
  registry.set(adapter.id, adapter)
}

export function getCommerceBackendAdapter(name?: string): CommerceBackendAdapter | undefined {
  return name ? registry.get(name) : undefined
}

export const CommerceBackendRegistry = {
  register: registerCommerceBackendAdapter,
  get: getCommerceBackendAdapter,
}
