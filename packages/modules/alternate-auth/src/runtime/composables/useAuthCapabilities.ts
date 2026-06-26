import { computed } from 'vue'

export function useAuthCapabilities() {
  const config = useRuntimeConfig()
  const auth = useAuth()

  const backend = computed(() => String((config.public as any)?.auth?.backend || 'better-auth').toLowerCase())
  const isBetterAuth = computed(() => backend.value === 'better-auth')

  const client = computed(() => (auth?.client as any) || {})
  const signIn = computed(() => (auth?.signIn as any) || {})

  const hasTwoFactor = computed(() => {
    const twoFactor = client.value?.twoFactor
    return (
      isBetterAuth.value &&
      !!twoFactor &&
      typeof twoFactor.sendOtp === 'function' &&
      typeof twoFactor.verifyOtp === 'function' &&
      typeof twoFactor.enable === 'function' &&
      typeof twoFactor.disable === 'function'
    )
  })

  const hasOrganization = computed(() => {
    const organization = client.value?.organization
    return isBetterAuth.value && !!organization && typeof organization.list === 'function'
  })

  const hasSocial = computed(() => isBetterAuth.value && typeof signIn.value?.social === 'function')

  const hasSso = computed(() => isBetterAuth.value && hasSocial.value)

  const hasProfileUpdate = computed(() => isBetterAuth.value && typeof client.value?.updateUser === 'function')

  return {
    backend,
    isBetterAuth,
    hasTwoFactor,
    hasOrganization,
    hasSocial,
    hasSso,
    hasProfileUpdate,
  }
}