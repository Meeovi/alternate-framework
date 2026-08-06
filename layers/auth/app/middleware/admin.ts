import { authClient } from "../../lib/auth-client";

export default defineNuxtRouteMiddleware(async () => {
  const snackbar = useSnackbar()
  const { data: sessionData } = await useAuth().useSession(useFetch)
  const session = (sessionData as any).value

  if (!session) {
    return navigateTo('/')
  }

  const user = session.user as any
  if (user?.role !== 'admin') {
    snackbar.show({
      message: 'You are not authorized to access this page',
      color: 'error'
    })
    return navigateTo('/app/user')
  }
})
