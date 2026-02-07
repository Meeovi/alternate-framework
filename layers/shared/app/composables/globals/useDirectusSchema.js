export async function useDirectusSchema(collection) {
    const nuxt = useNuxtApp()
    const adapter = nuxt?.$adapter
    if (adapter && typeof adapter.getSchema === 'function') {
        return await adapter.getSchema(collection)
    }

    // Fallback to direct Directus public API if configured
    try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.directus.url}/fields/${collection}`, {
            headers: {
                Authorization: `Bearer ${config.public.directus.auth.token}`
            }
        })
    } catch (e) {
        console.error('useDirectusSchema: no adapter available and Directus config fetch failed', e)
        throw e
    }
}