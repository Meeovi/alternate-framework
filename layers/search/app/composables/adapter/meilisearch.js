import { defineAlternateAdapter } from '@meeovi/core';
export function createMeilisearchAdapter(config) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    const adapter = {
        id: 'search:meilisearch',
        type: 'search',
        config,
        async search(query) {
            const params = new URLSearchParams({
                q: query.term,
                offset: String((query.page - 1) * query.pageSize),
                limit: String(query.pageSize)
            });
            const res = await fetch(`${config.host}/indexes/${config.index}/search?${params}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    filter: Object.entries(query.filters).map(([field, value]) => `${field} = ${value}`)
                })
            });
            const json = await res.json();
            return {
                items: json.hits,
                total: json.estimatedTotalHits ?? json.hits.length,
                page: query.page,
                pageSize: query.pageSize
            };
        }
    };
    return defineAlternateAdapter(adapter);
}
