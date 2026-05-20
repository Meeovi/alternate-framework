export default defineNuxtRouteMiddleware(() => {
  const snackbar = useSnackbar() // <-- your Vuetify snackbar composable
  const { loggedIn, user, options } = useAuth()
  
  if (!loggedIn.value) {
    return navigateTo(options.redirectGuestTo || '/')
  }
  
  if ((user.value as any)?.role !== 'admin') {
    snackbar.show({
      message: 'You are not authorized to access this page',
      color: 'error'
    })
    return navigateTo('/app/user')
  }
})
