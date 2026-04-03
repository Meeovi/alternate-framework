// Local stub implementations for account functions
// These are no-op stubs for the lists layer

export function cacheAccount(_account: any): void {
  // No-op: accounts are not cached in this layer
}

export async function fetchAccountInfo(_id: string): Promise<any> {
  // No-op: account fetching is handled elsewhere
  return null
}
