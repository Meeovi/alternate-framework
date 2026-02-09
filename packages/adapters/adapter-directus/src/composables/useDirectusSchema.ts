export async function useDirectusSchema(
    collection: string,
    options?: {
        adapter?: { getSchema?: (collection: string) => Promise<any> }
        directus?: { url: string; token?: string }
        fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>
    }
): Promise<any> {
    const adapter = options?.adapter ?? (typeof globalThis !== 'undefined' ? (globalThis as any).__DIRECTUS_ADAPTER : undefined)

    if (adapter && typeof adapter.getSchema === 'function') {
        return await adapter.getSchema(collection)
    }

    // Fallback to Directus public API using provided options (framework-agnostic)
    const fetcher = options?.fetch ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis as any) : undefined)
    const url = options?.directus?.url
    const token = options?.directus?.token

    if (!fetcher) {
        throw new Error('useDirectusSchema: no fetch implementation available and no adapter provided')
    }

    if (!url) {
        throw new Error('useDirectusSchema: no Directus URL configured (provide options.directus.url)')
    }

    const endpoint = `${url.replace(/\/$/, '')}/fields/${encodeURIComponent(collection)}`
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetcher(endpoint, { headers })
    if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`useDirectusSchema: Directus fetch failed ${res.status} ${body}`)
    }

    return await res.json()
}