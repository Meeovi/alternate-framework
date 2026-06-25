import type { MeeoviSearchAdapter } from "../adapter/types";

export async function checkAdapterHealth(adapter?: MeeoviSearchAdapter) {
  if (!adapter) return { ok: false, error: "no adapter" };

  try {
    const res = await adapter.search({ term: "", page: 1, pageSize: 1, filters: {} } as any);
    return { ok: true, total: res?.total ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export default checkAdapterHealth;
