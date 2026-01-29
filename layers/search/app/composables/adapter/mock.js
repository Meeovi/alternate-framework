import { defineAlternateAdapter } from '@meeovi/core';
export function createMockSearchAdapter(items = []) {
    const cfg = { provider: 'mock' };
    const adapter = {
        id: 'search:mock',
        type: 'search',
        config: cfg,
        async search(query) {
            const filtered = items.filter((item) => item.title.toLowerCase().includes(query.term.toLowerCase()));
            return {
                items: filtered,
                total: filtered.length,
                page: 1,
                pageSize: filtered.length
            };
        }
    };
    return defineAlternateAdapter(adapter);
}
