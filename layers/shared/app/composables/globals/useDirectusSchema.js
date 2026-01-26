export async function useDirectusSchema(collection) {
    const config = useRuntimeConfig()

    return await $fetch(`${config.public.directus.url}/fields/${collection}`, {
        headers: {
            Authorization: `Bearer ${config.public.directus.auth.token}`
        }
    })
}