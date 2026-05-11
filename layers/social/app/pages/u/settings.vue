<template>
  <v-container fluid class="pa-6 settings-page bg-background">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Profile Settings</span>
            <v-btn variant="text" prepend-icon="fas fa-arrow-left" to="/user">Back to Profile</v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-alert v-if="statusMessage" :type="statusType" variant="tonal" class="mb-4">
              {{ statusMessage }}
            </v-alert>

            <v-form @submit.prevent="saveProfile" class="d-flex flex-column ga-4">
              <v-card variant="tonal">
                <v-card-title>Identity</v-card-title>
                <v-card-text class="d-flex flex-column ga-3">
                  <v-row>
                    <v-col cols="12" md="3">
                      <v-text-field v-model="form.namePrefix" label="Name Prefix" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.firstName" label="First Name" prepend-inner-icon="fas fa-user" />
                    </v-col>
                    <v-col cols="12" md="5">
                      <v-text-field v-model="form.middleName" label="Middle Name" />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.lastName" label="Last Name" prepend-inner-icon="fas fa-user" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.nameSuffix" label="Name Suffix" />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.email" label="Email" type="email" prepend-inner-icon="fas fa-envelope" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="form.gender" :items="genderItems" label="Gender" />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.dob" label="Date of Birth" type="date" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.taxVat" label="Tax/VAT Number" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="tonal">
                <v-card-title>Profile Appearance</v-card-title>
                <v-card-text class="d-flex flex-column ga-3">
                  <v-text-field v-model="form.avatarUrl" label="Avatar URL" prepend-inner-icon="fas fa-image" />
                  <v-text-field v-model="form.coverUrl" label="Cover URL" prepend-inner-icon="fas fa-panorama" />
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-sheet rounded="lg" color="grey-lighten-3" class="pa-2">
                        <div class="text-caption mb-2">Avatar Preview</div>
                        <v-avatar size="80">
                          <v-img :src="avatarPreview" cover />
                        </v-avatar>
                      </v-sheet>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-sheet rounded="lg" color="grey-lighten-3" class="pa-2">
                        <div class="text-caption mb-2">Cover Preview</div>
                        <v-img :src="coverPreview" height="80" cover rounded="lg" />
                      </v-sheet>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="tonal">
                <v-card-title>Preferences</v-card-title>
                <v-card-text class="d-flex flex-column ga-2">
                  <v-checkbox v-model="form.newsletterAcceptance" label="Sign up for newsletter" hide-details />
                  <v-checkbox v-model="form.remoteShopping" label="Allow remote shopping assistance" hide-details />
                  <v-checkbox v-model="form.isSeller" label="I want to become a seller / vendor" hide-details />
                  <v-checkbox v-model="form.agreeToTerms" label="Agree to terms" hide-details />
                  <v-select v-model="form.themeMode" :items="themeModes" label="Theme" />
                </v-card-text>
              </v-card>

              <v-card variant="tonal">
                <v-card-title>Change Password</v-card-title>
                <v-card-text class="d-flex flex-column ga-3">
                  <v-text-field v-model="form.currentPassword" label="Current Password" type="password" prepend-inner-icon="fas fa-key" />
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.newPassword" label="New Password" type="password" prepend-inner-icon="fas fa-lock" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.confirmPassword" label="Confirm New Password" type="password" prepend-inner-icon="fas fa-lock" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <div class="d-flex ga-2">
                <v-btn type="submit" color="primary" :loading="saving">Save Changes</v-btn>
                <v-btn variant="outlined" @click="resetForm">Reset</v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const user = useCurrentUser()
const { fetchSession } = useAuth()
const loading = ref(false)
const theme = useTheme()
const config = useRuntimeConfig()
const authConfig = (config.public as any)?.auth ?? {}
const token = useCookie<string | null>(authConfig?.cookieName || 'auth-token')

const saving = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const genderItems = ['Male', 'Female', 'Other']
const themeModes = ['system', 'light', 'dark']
const THEME_STORAGE_KEY = 'elite-theme'

const form = reactive({
  namePrefix: '',
  firstName: '',
  middleName: '',
  lastName: '',
  nameSuffix: '',
  email: '',
  dob: '',
  taxVat: '',
  gender: '',
  newsletterAcceptance: false,
  remoteShopping: false,
  isSeller: false,
  agreeToTerms: false,
  avatarUrl: '',
  coverUrl: '',
  themeMode: 'system',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const applyThemeMode = (mode: string) => {
  if (!process.client) return

  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.change(prefersDark ? 'dark' : 'light')
    localStorage.removeItem(THEME_STORAGE_KEY)
    return
  }

  theme.change(mode === 'dark' ? 'dark' : 'light')
  localStorage.setItem(THEME_STORAGE_KEY, mode)
}

const profileStorageKey = computed(() => `meeovi:user-profile:${(user.value as any)?.id || 'guest'}`)

const avatarPreview = computed(() => {
  if (form.avatarUrl) return form.avatarUrl
  const seed = encodeURIComponent(`${form.firstName} ${form.lastName}`.trim() || form.email || 'User')
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
})

const coverPreview = computed(() => {
  return form.coverUrl || 'https://images.unsplash.com/photo-1496345966270-d173adcbdd0f?auto=format&fit=crop&w=2000&q=80'
})

const readStoredProfile = () => {
  if (!process.client) return null
  const raw = localStorage.getItem(profileStorageKey.value)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveStoredProfile = () => {
  if (!process.client || !(user.value as any)?.id) return
  localStorage.setItem(profileStorageKey.value, JSON.stringify({
    namePrefix: form.namePrefix,
    middleName: form.middleName,
    nameSuffix: form.nameSuffix,
    newsletterAcceptance: form.newsletterAcceptance,
    remoteShopping: form.remoteShopping,
    isSeller: form.isSeller,
    agreeToTerms: form.agreeToTerms,
    avatarUrl: form.avatarUrl,
    coverUrl: form.coverUrl,
    themeMode: form.themeMode,
  }))
}

const fillFromUser = () => {
  const stored = readStoredProfile() || {}
  const first = ((user.value as any)?.firstName || (user.value as any)?.firstname || '').toString()
  const last = ((user.value as any)?.lastName || (user.value as any)?.lastname || '').toString()
  const prefix = ((user.value as any)?.namePrefix || (user.value as any)?.prefix || '').toString()
  const middle = ((user.value as any)?.middleName || (user.value as any)?.middlename || '').toString()
  const suffix = ((user.value as any)?.nameSuffix || (user.value as any)?.suffix || '').toString()
  const name = ((user.value as any)?.name || '').toString().trim()

  const nameParts = name.split(' ').filter(Boolean)

  form.namePrefix = prefix || stored.namePrefix || ''
  form.firstName = first || nameParts[0] || ''
  form.middleName = middle || stored.middleName || ''
  form.lastName = last || nameParts.slice(1).join(' ') || ''
  form.nameSuffix = suffix || stored.nameSuffix || ''
  form.email = ((user.value as any)?.email || '').toString()
  form.dob = ((user.value as any)?.dob || '').toString()
  form.taxVat = ((user.value as any)?.taxVat || (user.value as any)?.taxvat || '').toString()
  form.gender = ((user.value as any)?.gender || '').toString()
  form.newsletterAcceptance = Boolean((user.value as any)?.newsletterAcceptance ?? stored.newsletterAcceptance)
  form.remoteShopping = Boolean((user.value as any)?.remoteShopping ?? stored.remoteShopping)
  form.isSeller = Boolean((user.value as any)?.isSeller ?? stored.isSeller)
  form.agreeToTerms = Boolean((user.value as any)?.agreeToTerms ?? stored.agreeToTerms)
  form.avatarUrl = ((user.value as any)?.profilePicture || (user.value as any)?.avatar || stored.avatarUrl || '').toString()
  form.coverUrl = ((user.value as any)?.coverImage || stored.coverUrl || '').toString()
  form.themeMode = (stored.themeMode || 'system').toString()
}

watchEffect(async () => {
  if (!token.value) {
    await navigateTo('/auth/login')
    return
  }

  if (!user.value?.id && !loading.value) {
    await fetchSession()
  }

  if (user.value?.id && !form.email) {
    fillFromUser()
  }
})

const resetForm = () => {
  fillFromUser()
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  statusMessage.value = ''
}

const toMagentoGender = (value: string) => {
  if (value === 'Male') return 1
  if (value === 'Female') return 2
  if (value === 'Other') return 3
  return null
}

const saveProfile = async () => {
  if (!token.value) {
    await navigateTo('/auth/login')
    return
  }

  saving.value = true
  statusMessage.value = ''

  try {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      throw new Error('New password and confirmation do not match')
    }

    if (form.newPassword && !form.currentPassword) {
      throw new Error('Current password is required to change password')
    }

    const res = await $fetch<{ data?: { updateCustomerV2?: { customer?: any } }, errors?: Array<{ message?: string }> }>('/api/graphql', {
      method: 'POST',
      body: {
        query: `
          mutation UpdateCustomer($input: CustomerInput!) {
            updateCustomerV2(input: $input) {
              customer {
                id
                firstname
                lastname
                email
              }
            }
          }
        `,
        variables: {
          input: {
            prefix: form.namePrefix || null,
            firstname: form.firstName,
            middlename: form.middleName || null,
            lastname: form.lastName,
            suffix: form.nameSuffix || null,
            email: form.email,
            dob: form.dob || null,
            taxvat: form.taxVat || null,
            gender: toMagentoGender(form.gender),
          },
        },
      },
    })

    if (res.errors?.length) {
      throw new Error(res.errors[0]?.message || 'Unable to update profile')
    }

    if (form.newPassword) {
      const passwordRes = await $fetch<{ data?: { changeCustomerPassword?: any }, errors?: Array<{ message?: string }> }>('/api/graphql', {
        method: 'POST',
        body: {
          query: `
            mutation ChangeCustomerPassword($currentPassword: String!, $newPassword: String!) {
              changeCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
                id
              }
            }
          `,
          variables: {
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          },
        },
      })

      if (passwordRes.errors?.length) {
        throw new Error(passwordRes.errors[0]?.message || 'Password update failed')
      }
    }

    await fetchSession()
    saveStoredProfile()
    applyThemeMode(form.themeMode)

    if (user.value) {
      ;(user.value as any).profilePicture = form.avatarUrl || null
      ;(user.value as any).avatar = form.avatarUrl || null
      ;(user.value as any).coverImage = form.coverUrl || null
      ;(user.value as any).namePrefix = form.namePrefix || null
      ;(user.value as any).middleName = form.middleName || null
      ;(user.value as any).nameSuffix = form.nameSuffix || null
      ;(user.value as any).newsletterAcceptance = form.newsletterAcceptance
      ;(user.value as any).remoteShopping = form.remoteShopping
      ;(user.value as any).isSeller = form.isSeller
      ;(user.value as any).agreeToTerms = form.agreeToTerms
    }

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    statusType.value = 'success'
    statusMessage.value = 'Profile updated successfully.'
  } catch (err: any) {
    statusType.value = 'error'
    statusMessage.value = err?.message || 'Unable to update profile'
  } finally {
    saving.value = false
  }
}

definePageMeta({
  layout: 'nolive',
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}
</style>
