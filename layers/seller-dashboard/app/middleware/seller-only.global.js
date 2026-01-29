export default defineNuxtRouteMiddleware((to, from) => {
    // Try a few common places for the current user so the middleware is flexible
    const nuxtApp = useNuxtApp();
    const user = nuxtApp.$auth?.user ?? useState('authUser')?.value ?? useState('user')?.value;
    if (!user) {
        return navigateTo('/login');
    }
    const roles = user.role ? [user.role] : user.roles ?? [];
    if (!roles.includes('seller') && !roles.includes('admin')) {
        return navigateTo('/');
    }
});
