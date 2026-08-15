export default defineNuxtRouteMiddleware(async (to) => {
    const { data: session } = await useAuth().useSession(useFetch)
    if (!session?.user) {
        return navigateTo({ path: "/login", query: { redirect: to.fullPath } })
    }
})
