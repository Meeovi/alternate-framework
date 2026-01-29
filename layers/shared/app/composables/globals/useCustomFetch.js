export function useCustomFetch(url, options = {}) {
    return {
        ...useFetch(url, {
            ...options,
            $fetch: useNuxtApp().$customFetch
        })
    };
}
