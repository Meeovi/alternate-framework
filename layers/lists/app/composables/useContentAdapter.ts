import { useNuxtApp } from '#imports'

// Minimal content adapter for the lists layer.
// If a global `useContentAdapter` is provided via imports, prefer it.
export function useContentAdapter() {
  try {
    const imp = (globalThis as any).__imports__ || (useNuxtApp && useNuxtApp().$imports) || {}
    if (imp && typeof imp.useContentAdapter === 'function') {
      return imp.useContentAdapter()
    }
  }
  catch (e) {
    // ignore
  }

  // Local fallback implementation that proxies to existing masto helpers when available.
  function getMastoClient() {
    try {
      // prefer a globally available `useMastoClient` if present
      if (typeof (globalThis as any).useMastoClient === 'function')
        return (globalThis as any).useMastoClient()
      // otherwise try to use a local `useMasto` composable
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const maybe = require?.('./masto') || undefined
      if (maybe && typeof maybe.useMasto === 'function')
        return maybe.useMasto()
      // last-resort: try to call a top-level useMastoClient (may be auto-imported)
      // @ts-ignore
      if (typeof useMastoClient !== 'undefined') return useMastoClient()
    } catch (e) {
      // ignore
    }
    return null
  }

  // Default helper implementations used by lists pages/components.
  return {
    useMastoClient: getMastoClient,
    getPublicLists: () => {
      const client = getMastoClient()
      return client ? client.v1.lists.list() : Promise.resolve([])
    },
    getUserLists: (firstName?: string, lastName?: string) => {
      const client = getMastoClient()
      const acct = firstName && lastName ? `${firstName} ${lastName}` : undefined
      if (!client) return Promise.resolve([])
      if (!acct) return client.v1.lists.list()
      return client.v1.accounts.$select(acct).lists.list()
    },
    getUserBookmarks: (firstName?: string, lastName?: string) => {
      const client = getMastoClient()
      const acct = firstName && lastName ? `${firstName} ${lastName}` : undefined
      if (!client) return Promise.resolve([])
      if (!acct) return Promise.resolve([])
      return client.v1.accounts.$select(acct).favourites.list()
    },
    getPage: async (id: number) => {
      // best-effort: try to fetch a local content store endpoint
      try {
        const res = await fetch(`/api/pages/${id}`)
        if (!res.ok) return null
        return res.json()
      } catch (e) {
        return null
      }
    },
    getAssetUrl: (asset: any) => {
      if (!asset) return ''
      if (asset.filename_disk) return `/uploads/${asset.filename_disk}`
      if (asset.url) return asset.url
      return ''
    }
  }
}

export default useContentAdapter
import { getListsConfig } from '../config'
import { getContentProvider } from './content/registry'

export function useContentAdapter() {
  const { provider } = getListsConfig()
  const adapter = getContentProvider(provider)
  return adapter
}

export default useContentAdapter
