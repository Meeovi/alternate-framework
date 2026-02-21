export function getAuthPlugins(opts: any = {}) {
  // Minimal shim: return an empty plugin list. Adapter package provide real plugins when available.
  return []
}

export default getAuthPlugins
