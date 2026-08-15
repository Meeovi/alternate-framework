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

export interface CommerceBackendAdapter {
  readonly id: string
  readonly collections: string[]
  isEnabled(): boolean
  /** Must return Directus-shaped data, already unwrapped (no {data:...} envelope). */
  request(descriptor: DirectusRequestDescriptor): Promise<any>
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
