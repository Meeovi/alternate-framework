import { defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { createDirectus, rest, readItem, readItems, createItem, deleteItem, updateItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime, authentication, readMe, staticToken } from '@directus/sdk';
import type { RestCommand } from '@directus/sdk';
import { CommerceBackendRegistry } from 'alternate-sdk';

// Only these collections are backend-swappable — everything else (CMS
// content: navigation, pages, page_blocks, brands, shops, departments,
// categories, ...) always goes to real Directus regardless of which
// commerce backend is active, since Directus remains the CMS layer no
// matter which commerce backend is used. departments/categories are
// deliberately excluded even though they're commerce-adjacent: they're
// Directus-only CMS taxonomy (name/description/image/slug), and
// "departments" specifically has no equivalent concept in any other
// backend at all. Cross-referencing their PRODUCT contents with the active
// backend is handled separately and explicitly via
// CommerceBackendAdapter.getProductsByCategory(), called directly from
// app/pages/departments/[...slug].vue and
// app/pages/departments/category/[...id].vue — see those files.
const IN_SCOPE_COLLECTIONS = new Set(['products', 'orders']);

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const directusUrl = `${config.public.directus.url}`

    // The static token is server-only. On the server we call Directus
    // directly with it; in the browser it must never be present, so
    // requests go through the same-origin /api/cms proxy which injects it.
    const serverToken = import.meta.server ? (config as any).directus?.token : undefined

    // `realDirectus` keeps `.url` pointed at the real Directus instance so
    // templates that build `${$directus.url}/assets/...` image URLs keep
    // working (Directus assets are served without a bearer token anyway).
    const realDirectus = createDirectus(directusUrl)
        .with(rest())
        .with(authentication())

    // The client that actually issues `.request()` calls: the real
    // Directus URL + token on the server, the token-less /api/cms proxy in
    // the browser.
    const requestClient = import.meta.server
        ? createDirectus(directusUrl).with(rest()).with(authentication()).with(staticToken(serverToken || ''))
        : createDirectus(`${window.location.origin}/api/cms`).with(rest())

    const activeBackendName = (config.public as any).commerceBackend || 'directus'

    // readItem/readItems bake `path: /items/<collection>[/<key>]` into a
    // zero-argument closure — string-matching that path is enough to route
    // per-collection without touching how any call site builds its request.
    // GET-only: writes (createItem/updateItem/deleteItem) always pass
    // through to real Directus unmodified, regardless of active backend.
    const directus = {
        ...realDirectus,
        async request<Output>(getOptions: RestCommand<Output, any>): Promise<Output> {
            const options = getOptions()
            const match = activeBackendName !== 'directus'
                ? options.path.match(/^\/items\/([^/]+)(?:\/(.+))?$/)
                : null
            const collection = match?.[1]

            if (options.method === 'GET' && collection && IN_SCOPE_COLLECTIONS.has(collection)) {
                const adapter = CommerceBackendRegistry.get(activeBackendName)
                if (adapter?.collections.includes(collection)) {
                    return adapter.request({ method: 'GET', collection, key: match?.[2], params: options.params })
                }
            }
            // Server: real Directus + token. Browser: the /api/cms proxy.
            return requestClient.request(getOptions)
        },
    }

    return {
        provide: { directus, readItem, readItems, createItem, deleteItem, updateItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime, authentication, readMe },
    };
});
