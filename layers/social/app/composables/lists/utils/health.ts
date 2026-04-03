import { getListsProvider } from '../registry'
import { getListsConfig } from '../config'

export async function checkListsProviderHealth(providerName?: string) {
  try {
    const cfg = getListsConfig()
    const name = providerName || cfg.provider || 'directus'
    const provider = getListsProvider(name)
    const lists = await provider.listLists()
    return { ok: true, count: Array.isArray(lists) ? lists.length : null }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

export default checkListsProviderHealth
