export async function checkAdapterHealth(adapter) {
    try {
        // perform a minimal search to verify connectivity
        const res = await adapter.search({ term: '', page: 1, pageSize: 1, filters: {} });
        return { ok: true, total: res?.total ?? null };
    }
    catch (e) {
        return { ok: false, error: e?.message || String(e) };
    }
}
export default checkAdapterHealth;
