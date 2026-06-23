declare function useNuxtApp(): any

/**
 * Adapter-aware request helpers.
 * Prefer runtime adapter injected on the Nuxt app (e.g. `nuxt.$adapter`).
 * If not present, fall back to runtime `globalThis.__directus` or Nuxt helpers
 * exposed at runtime (e.g. `$readItems`, `$createItem`). This avoids static
 * imports of Directus SDK at build time.
 */
export default function useDirectusRequest() {
  const nuxt = typeof useNuxtApp === 'function' ? useNuxtApp() as any : (globalThis as any).__nuxtApp || {}

  function _toast(message: string) {
    try {
      const toast = nuxt?.$toast || (globalThis as any).__toast
      if (toast && typeof toast.error === 'function') toast.error(message)
    } catch (_) {}
  }

  function resolveAdapter() {
    return nuxt?.$adapter || (globalThis as any).__adapter || null
  }

  function resolveDirectusClient() {
    // prefer Nuxt-injected $directus, then globalThis directus helpers
    return nuxt?.$directus || (globalThis as any).__directus || null
  }

  async function request(config: any) {
    try {
      const adapter = resolveAdapter()
      if (adapter && typeof adapter.request === 'function') return await adapter.request(config)

      const client = resolveDirectusClient()
      if (!client || typeof client.request !== 'function') {
        _toast('Data client unavailable')
        throw new Error('Data client.request is not available')
      }

      return await client.request(config)
    } catch (e) {
      _toast('Request failed')
      throw e
    }
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItems === 'function') return await adapter.readItems(collection, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readItems || (globalThis as any).__readItems
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }

    _toast('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItem === 'function') return await adapter.readItem(collection, id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readItem || (globalThis as any).__readItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id, opts))
    }

    _toast('readItem not available')
    throw new Error('readItem not available')
  }

  async function readUsers(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readUsers === 'function') return await adapter.readUsers(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readUsers || (globalThis as any).__readUsers
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readUsers not available')
    throw new Error('readUsers not available')
  }

  async function readUser(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readUser === 'function') return await adapter.readUser(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readUser || (globalThis as any).__readUser
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readUser not available')
    throw new Error('readUser not available')
  }

  async function readRoles(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readRoles === 'function') return await adapter.readRoles(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readRoles || (globalThis as any).__readRoles
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readRoles not available')
    throw new Error('readRoles not available')
  }

  async function readRole(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readRole === 'function') return await adapter.readRole(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readRole || (globalThis as any).__readRole
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readRole not available')
    throw new Error('readRole not available')
  }

  async function readFolders(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFolders === 'function') return await adapter.readFolders(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFolders || (globalThis as any).__readFolders
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readFolders not available')
    throw new Error('readFolders not available')
  }

  async function readFolder(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFolder === 'function') return await adapter.readFolder(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFolder || (globalThis as any).__readFolder
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readFolder not available')
    throw new Error('readFolder not available')
  }

  async function readFiles(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFiles === 'function') return await adapter.readFiles(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFiles || (globalThis as any).__readFiles
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readFiles not available')
    throw new Error('readFiles not available')
  }

  async function readFile(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFile === 'function') return await adapter.readFile(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFile || (globalThis as any).__readFile
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readFile not available')
    throw new Error('readFile not available')
  }

  async function readFlows(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFlows === 'function') return await adapter.readFlows(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFlows || (globalThis as any).__readFlows
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readFlows not available')
    throw new Error('readFlows not available')
  }

  async function readFlow(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFlow === 'function') return await adapter.readFlow(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFlow || (globalThis as any).__readFlow
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readFlow not available')
    throw new Error('readFlow not available')
  }

  async function readShares(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readShares === 'function') return await adapter.readShares(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readShares || (globalThis as any).__readShares
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readShares not available')
    throw new Error('readShares not available')
  }

  async function readShare(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readShare === 'function') return await adapter.readShare(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readShare || (globalThis as any).__readShare
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readShare not available')
    throw new Error('readShare not available')
  }

  async function readPanels(opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readPanels === 'function') return await adapter.readPanels(opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readPanels || (globalThis as any).__readPanels
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(opts))
    }

    _toast('readPanels not available')
    throw new Error('readPanels not available')
  }

  async function readPanel(id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readPanel === 'function') return await adapter.readPanel(id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readPanel || (globalThis as any).__readPanel
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(id, opts))
    }

    _toast('readPanel not available')
    throw new Error('readPanel not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFieldsByCollection === 'function') return await adapter.readFieldsByCollection(collection, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFieldsByCollection || (globalThis as any).__readFieldsByCollection
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }

    _toast('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function createItems(collection: string, payload: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.createItems === 'function') return await adapter.createItems(collection, payload)

    const client = resolveDirectusClient()
    const builder = nuxt?.$createItems || (globalThis as any).__createItems
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, payload))
    }

    _toast('createItems not available')
    throw new Error('createItems not available')
  }

  async function updateItems(collection: string, keysOrQuery: any, payload: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.updateItems === 'function') return await adapter.updateItems(collection, keysOrQuery, payload)

    const client = resolveDirectusClient()
    const builder = nuxt?.$updateItems || (globalThis as any).__updateItems
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, keysOrQuery, payload))
    }

    _toast('updateItems not available')
    throw new Error('updateItems not available')
  }

  async function deleteItem(collection: string, id: string) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function') return await adapter.deleteItem(collection, id)

    const client = resolveDirectusClient()
    const builder = nuxt?.$deleteItem || (globalThis as any).__deleteItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id))
    }

    _toast('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function deleteItems(collection: string, keysOrQuery: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItems === 'function') return await adapter.deleteItems(collection, keysOrQuery)

    const client = resolveDirectusClient()
    const builder = nuxt?.$deleteItems || (globalThis as any).__deleteItems
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, keysOrQuery))
    }

    _toast('deleteItems not available')
    throw new Error('deleteItems not available')
  }

  return {
    request,
    readItems,
    readItem,
    readUsers,
    readUser,
    readRoles,
    readRole,
    readFolders,
    readFolder,
    readFiles,
    readFile,
    readFlows,
    readFlow,
    readShares,
    readShare,
    readPanels,
    readPanel,
    readFieldsByCollection,
    createItem,
    createItems,
    updateItem,
    updateItems,
    deleteItem,
    deleteItems,
    uploadFiles
  }
}
