import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { createDirectus, rest, readItem, readItems, createItem, deleteItem, updateItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime, authentication, readMe, staticToken } from '@directus/sdk';
import type { RestCommand } from '@directus/sdk';
import { CommerceBackendRegistry } from 'alternate-sdk';
import "dotenv"

// Only these collections are backend-swappable — everything else (CMS
// content: navigation, pages, page_blocks, brands, shops, ...) always goes
// to real Directus regardless of which commerce backend is active, since
// Directus remains the CMS layer no matter which commerce backend is used.
const IN_SCOPE_COLLECTIONS = new Set(['products', 'categories', 'departments', 'orders']);

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const token = config.public.directus?.auth?.token

    const realDirectus = createDirectus(`${config.public.directus.url}`)
        .with(rest())
        .with(authentication())
        .with(staticToken(token || ''))

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
            return realDirectus.request(getOptions)
        },
    }

    return {
        provide: { directus, readItem, readItems, createItem, deleteItem, updateItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime, authentication, readMe },
    };
});
