import { useAlternateContext } from '@meeovi/core';
export function useContentFallback() {
    try {
        const ctx = useAlternateContext();
        const adapter = ctx.getAdapter('catalog');
        // If a content-capable adapter is available and exposes methods, use it
        if (adapter && typeof adapter.listShops === 'function') {
            return {
                adapter,
                listShops: (opts) => adapter.listShops(opts),
                getBrandBySlug: (slug) => adapter.getBrandBySlug?.(slug),
                getPage: (id) => adapter.getPage?.(id)
            };
        }
    }
    catch (e) {
        // ignore
    }
    // Fallback to Directus via Nuxt runtime
    return {
        adapter: null,
        async listShops(params) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItems) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItems('shops', params || {}));
                return res || [];
            }
            return [];
        },
        async listBrands(params) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItems) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItems('brands', params || {}));
                return res || [];
            }
            return [];
        },
        async getBrandBySlug(slug) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItems) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItems('brands', { filter: { slug: { _eq: slug } }, limit: 1 }));
                return res?.[0] || null;
            }
            return null;
        },
        async getPage(id) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItem) {
                return await nuxtApp.$directus.request(nuxtApp.$readItem('pages', id));
            }
            return null;
        }
    };
}
export default useContentFallback;
