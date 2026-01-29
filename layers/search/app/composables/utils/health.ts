import type { SearchAdapter } from '@meeovi/core'

export async function checkAdapterHealth(adapter: SearchAdapter<any>) {
  try {
    // perform a minimal search to verify connectivity
    const res = await adapter.search({ term: '', page: 1, pageSize: 1, filters: {} } as any)
    return { ok: true, total: res?.total ?? null }
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

export default checkAdapterHealth
