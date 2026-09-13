import { computed, watchEffect } from 'vue'
import { useCookie, useRuntimeConfig, useState } from '#imports'

/**
 * Identity + profile-detail state for `/u/`.
 *
 * State is held in `useState` so the page and every extracted
 * `components/features/profile/*` card read the same values without prop
 * drilling. `bindWatchers()` wires the reactive side effects and must be
 * called exactly once (from the page).
 */
export function useProfileIdentity() {
  const config = useRuntimeConfig()
  const authConfig = (config.public as any)?.auth ?? {}

  // Legacy Magento customer-token cookie. It only gates the commerce
  // GraphQL calls (gift cards / subscriptions / customer fallback) — the
  // real app-session gate is the `auth` route middleware.
  const token = useCookie<string | null>(authConfig?.cookieName || 'auth-token')

  const user = useState<any>('profile:user', () => null)
  const customerFallback = useState<any>('profile:customer-fallback', () => null)
  const storedProfile = useState<any>('profile:stored', () => null)
  const profileLoadError = useState<string>('profile:load-error', () => '')

  /** Copy the better-auth session user into local, mutable state. */
  const setSessionUser = (sessionUser: any) => {
    if (!sessionUser) {
      user.value = null
      return
    }
    // A fresh object: `loadCustomerFallback` merges fields in place and we
    // must not mutate the session payload itself.
    if (!user.value || user.value.id !== sessionUser.id) {
      user.value = { ...sessionUser }
    }
  }

  const profileStorageKey = computed(() => `meeovi:user-profile:${user.value?.id || 'guest'}`)

  const syncStoredProfile = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(profileStorageKey.value)
      storedProfile.value = raw ? JSON.parse(raw) : null
    } catch {
      storedProfile.value = null
    }
  }

  const displayName = computed(() => {
    const source = user.value || customerFallback.value || {}
    const first = source?.firstName || source?.firstname || ''
    const last = source?.lastName || source?.lastname || ''
    const name = source?.name || ''
    return [first, last].filter(Boolean).join(' ').trim() || name || 'My Profile'
  })

  const userEmail = computed(() => user.value?.email || customerFallback.value?.email || 'No email')
  const userId = computed(() => user.value?.id || customerFallback.value?.id || '-')
  const userRole = computed(() => user.value?.role || 'Customer')

  const avatarUrl = computed(() => {
    const img = user.value?.profilePicture
      || user.value?.avatar
      || user.value?.image
      || storedProfile.value?.avatarUrl
    if (img) return img
    const seed = encodeURIComponent(displayName.value || userEmail.value || 'User')
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
  })

  const coverImage = computed(() =>
    user.value?.coverImage
    || storedProfile.value?.coverUrl
    || 'https://images.unsplash.com/photo-1496345966270-d173adcbdd0f?auto=format&fit=crop&w=2000&q=80')

  const isSeller = computed(() => {
    const source = user.value || customerFallback.value || {}
    return Boolean(source?.isSeller || storedProfile.value?.isSeller)
  })

  const needsProfileDetails = computed(() =>
    !user.value?.email || !user.value?.firstName || !user.value?.lastName)

  const loadCustomerFallback = async () => {
    if (!token.value) return

    const response = await $fetch<{ data?: { customer?: any }, errors?: Array<{ message?: string }> }>('/api/graphql', {
      method: 'POST',
      body: {
        query: `
          query ProfileCustomer {
            customer {
              id
              firstname
              lastname
              email
            }
          }
        `,
      },
    }).catch(() => ({ data: null, errors: [{ message: 'Unable to load customer profile' }] }))

    if (response.errors?.length) {
      profileLoadError.value = response.errors[0]?.message || 'Unable to load profile details from customer API'
      return
    }

    customerFallback.value = response.data?.customer || null
    if (customerFallback.value?.id && user.value) {
      user.value.email = user.value.email || customerFallback.value.email || null
      user.value.firstName = user.value.firstName || customerFallback.value.firstname || null
      user.value.lastName = user.value.lastName || customerFallback.value.lastname || null
    }
  }

  /** Call once, from the page. */
  const bindWatchers = () => {
    watchEffect(syncStoredProfile)
    watchEffect(() => {
      if (needsProfileDetails.value && !customerFallback.value?.id) {
        void loadCustomerFallback()
      }
    })
  }

  return {
    token,
    user,
    customerFallback,
    storedProfile,
    profileLoadError,
    displayName,
    userEmail,
    userId,
    userRole,
    avatarUrl,
    coverImage,
    isSeller,
    setSessionUser,
    loadCustomerFallback,
    bindWatchers,
  }
}
