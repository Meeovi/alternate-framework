export default defineNuxtRouteMiddleware(async (to) => {
    const { data: session } = await useAuth().useSession(useFetch)
    if (!session?.value?.user) {
        return navigateTo({ path: "/login", query: { redirect: to.fullPath } })
    }
})
