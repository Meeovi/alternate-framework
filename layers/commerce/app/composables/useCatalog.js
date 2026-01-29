import { useAlternateContext } from '@meeovi/core';
export function useCatalogFallback() {
    // Attempt to use core runtime adapter if present
    try {
        const ctx = useAlternateContext();
        const adapter = ctx.getAdapter('catalog');
        if (adapter) {
            return {
                adapter,
                async getProductById(id) {
                    return adapter.getProductById(id);
                },
                async getProductBySlug(slug) {
                    return adapter.getProductBySlug(slug);
                },
                async listProducts(params) {
                    return adapter.listProducts(params);
                }
            };
        }
    }
    catch (e) {
        // runtime context not available
    }
    // Fallback to Directus via Nuxt app runtime (assumes component calling runs in Vue context)
    return {
        adapter: null,
        async getProductById(_id) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItem) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItem('products', { filter: { id: { _eq: _id } }, limit: 1 }));
                return res?.[0] || null;
            }
            return null;
        },
        async getProductBySlug(slug) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItem) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItem('products', { filter: { slug: { _eq: slug } }, limit: 1 }));
                return res?.[0] || null;
            }
            return null;
        },
        async listProducts(params) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItems) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItems('products', params || {}));
                return res || [];
            }
            return [];
        },
        async listAttributes(filter) {
            const nuxtApp = useNuxtApp();
            if (nuxtApp?.$directus && nuxtApp.$readItems) {
                const res = await nuxtApp.$directus.request(nuxtApp.$readItems('attributes', filter || {}));
                return res || [];
            }
            return [];
        }
    };
}
