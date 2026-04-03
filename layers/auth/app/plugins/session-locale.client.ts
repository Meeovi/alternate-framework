import { watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useSessionLocale } from '../composables/useSessionLocale'

export default defineNuxtPlugin(() => {
  const auth = useAuth()
  const { locale } = (useNuxtApp() as any).$i18n
  const { persistLocaleForUser, restoreLocaleForUser } = useSessionLocale()

  watch(
    () => auth.user.value?.id || auth.user.value?.email || null,
    async (currentUserKey, previousUserKey) => {
      if (!currentUserKey || currentUserKey === previousUserKey) {
        return
      }

      await restoreLocaleForUser(auth.user.value)
    },
    { immediate: true }
  )

  watch(
    () => locale.value,
    (currentLocale) => {
      if (!auth.loggedIn.value) {
        return
      }

      persistLocaleForUser(auth.user.value, currentLocale)
    }
  )
})