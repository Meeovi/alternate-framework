import { unwrap } from './utils';
export const createStarterSearchAdapter = (transport) => ({
    async search(query) {
        const res = await transport.request('POST', '/search', { body: query });
        return unwrap(res);
    },
    async facets(query) {
        const res = await transport.request('POST', '/search/facets', { body: query });
        return unwrap(res);
    }
});
