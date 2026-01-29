export default defineNuxtRouteMiddleware((to, from) => {
  // Try a few common places for the current user so the middleware is flexible
  const nuxtApp = useNuxtApp()
  const user = (nuxtApp as any).$auth?.user ?? (useState as any)('authUser')?.value ?? (useState as any)('user')?.value

  if (!user) {
    return navigateTo('/login')
  }

  const roles: string[] = user.role ? [user.role] : user.roles ?? []
  if (!roles.includes('seller') && !roles.includes('admin')) {
    return navigateTo('/')
  }
})
