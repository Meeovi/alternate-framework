import { defineAlternateAdapter } from '@meeovi/core';
import { normalizeOpenSearchHit } from '../utils/normalizers';
export function createOpenSearchAdapter(config) {
    const adapter = {
        id: 'search:opensearch',
        type: 'search',
        config,
        async search(query) {
            const body = {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query.term,
                                    fields: ['title^3', 'description', 'tags']
                                }
                            }
                        ],
                        filter: Object.entries(query.filters).map(([field, value]) => ({
                            term: { [field]: value }
                        }))
                    }
                },
                from: (query.page - 1) * query.pageSize,
                size: query.pageSize
            };
            const res = await fetch(`${config.endpoint}/${config.index}/_search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
                },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            return {
                items: json.hits.hits.map(normalizeOpenSearchHit),
                total: json.hits.total.value,
                page: query.page,
                pageSize: query.pageSize
            };
        }
    };
    return defineAlternateAdapter(adapter);
}
