export interface CommerceCustomerLinker {
  readonly id: string
  isEnabled(): boolean
  /** Called once, after an auth user is created. Returns the id to persist, or undefined to skip. */
  onUserCreated(user: { id: string; email: string; name?: string }): Promise<{ externalCustomerId: string } | undefined>
}

const linkers = new Map<string, CommerceCustomerLinker>()

export function registerCommerceCustomerLinker(linker: CommerceCustomerLinker): void {
  linkers.set(linker.id, linker)
}

export function getCommerceCustomerLinkers(): CommerceCustomerLinker[] {
  return [...linkers.values()]
}

export const CommerceCustomerLinkRegistry = {
  register: registerCommerceCustomerLinker,
  getAll: getCommerceCustomerLinkers,
}
