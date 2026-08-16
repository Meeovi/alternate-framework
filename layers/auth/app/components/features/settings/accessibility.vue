<template>
  <v-container class="max-width-800 my-8">
    <v-card elevation="2" rounded="lg">
      <v-toolbar color="primary" class="text-white" flat>
        <v-icon start class="ml-4">mdi-accessibility</v-icon>
        <v-toolbar-title>Accessibility & Security</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-6">
        <!-- Alerts -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" closable class="mb-4" @click:close="clearError">
          {{ errorMsg }}
        </v-alert>
        <v-alert v-if="successMsg" type="success" variant="tonal" closable class="mb-4" @click:close="clearSuccess">
          {{ successMsg }}
        </v-alert>

        <v-tabs v-model="activeTab" bg-color="grey-lighten-4" color="primary" grow class="mb-6">
          <v-tab value="passkeys">
            <v-icon start>mdi-key</v-icon>
            Passkeys
          </v-tab>
          <v-tab value="two-factor">
            <v-icon start>mdi-shield-lock</v-icon>
            Two-Factor Auth
          </v-tab>
          <v-tab value="sessions">
            <v-icon start>mdi-devices</v-icon>
            Active Sessions
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- PASSKEYS TAB -->
          <v-window-item value="passkeys">
            <div class="mb-4">
              <p class="text-body-2 text-medium-emphasis mb-4">
                Passkeys let you sign in with biometrics or a device PIN instead of a password. They're more secure and easier to use.
              </p>

              <!-- Add Passkey -->
              <div class="d-flex gap-2 mb-6">
                <v-text-field
                  v-model="newPasskeyName"
                  label="Passkey name (optional)"
                  placeholder="e.g. My iPhone, Work Laptop"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1"
                  :disabled="isPasskeyLoading"
                />
                <v-btn
                  color="primary"
                  size="large"
                  :loading="isPasskeyLoading"
                  :disabled="!session"
                  @click="addPasskey"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Add Passkey
                </v-btn>
              </div>

              <!-- Passkeys List -->
              <div v-if="passkeys.length === 0 && !isPasskeyLoading" class="text-center py-8">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-key-outline</v-icon>
                <p class="text-body-1 text-medium-emphasis">No passkeys registered</p>
                <p class="text-body-2 text-medium-emphasis">Add a passkey to sign in without a password.</p>
              </div>

              <v-list v-else-if="passkeys.length > 0" border rounded class="rounded-lg">
                <v-list-item
                  v-for="passkey in passkeys"
                  :key="passkey.id"
                  class="py-3"
                >
                  <template #prepend>
                    <v-avatar color="blue-lighten-4" class="mr-3">
                      <v-icon color="blue">mdi-key</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ passkey.name || getAuthenticatorName(passkey.aaguid) || 'Passkey' }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="mt-1">
                    Created {{ new Date(passkey.createdAt).toLocaleDateString() }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      color="error"
                      size="small"
                      :disabled="isPasskeyLoading"
                      @click="deletePasskey(passkey.id)"
                    />
                  </template>
                </v-list-item>
              </v-list>

              <v-skeleton-loader v-else type="list-item-avatar" />
            </div>
          </v-window-item>

          <!-- TWO-FACTOR AUTH TAB -->
          <v-window-item value="two-factor">
            <div v-if="!session" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else-if="!session.user?.twoFactorEnabled" class="text-center py-6">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-shield-off-outline</v-icon>
              <h3 class="text-h6 mb-2">Two-factor authentication is not enabled</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">
                Add an extra layer of security to your account by enabling 2FA.
              </p>

              <div v-if="twoFactorStep === 'password'" class="max-w-md mx-auto">
                <v-form @submit.prevent="enableTwoFactor">
                  <v-text-field
                    v-model="twoFactorPassword"
                    label="Password"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    :disabled="isTwoFactorLoading"
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="isTwoFactorLoading"
                  >
                    Enable Two-Factor Authentication
                  </v-btn>
                  <p v-if="twoFactorError" class="text-error text-sm mt-2">{{ twoFactorError }}</p>
                </v-form>
              </div>

              <div v-else-if="twoFactorStep === 'qr'" class="max-w-md mx-auto">
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <img v-if="qrDataUrl" :src="qrDataUrl" alt="2FA QR Code" class="mx-auto mb-4 qr-code-img" />
                <v-form @submit.prevent="verifyTwoFactor">
                  <v-text-field
                    v-model="totpCode"
                    label="Verification Code"
                    type="text"
                    maxlength="6"
                    variant="outlined"
                    class="mb-4"
                    :disabled="isTwoFactorLoading"
                  />
                  <v-btn
                    type="submit"
                    color="success"
                    size="large"
                    block
                    :loading="isTwoFactorLoading"
                  >
                    Verify and Enable
                  </v-btn>
                  <p v-if="twoFactorError" class="text-error text-sm mt-2">{{ twoFactorError }}</p>
                </v-form>
              </div>

              <div v-else-if="twoFactorStep === 'backup'" class="max-w-md mx-auto">
                <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
                <h3 class="text-h6 mb-2 text-success">2FA Enabled Successfully</h3>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <v-sheet border rounded class="pa-4 bg-grey-lighten-4 text-center font-mono text-sm mb-4">
                  <p v-for="code in backupCodes" :key="code" class="py-1">{{ code }}</p>
                </v-sheet>
                <v-btn color="primary" block @click="dismissTwoFactorSuccess">
                  Done
                </v-btn>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <v-icon size="48" color="success" class="mb-2">mdi-shield-check</v-icon>
              <h3 class="text-h6 mb-2 text-success">Two-factor authentication is enabled</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">
                Your account is protected with an extra layer of security.
              </p>

              <div class="max-w-md mx-auto">
                <v-form @submit.prevent="disableTwoFactor">
                  <v-text-field
                    v-model="disablePassword"
                    label="Password to confirm"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    :disabled="isTwoFactorLoading"
                  />
                  <v-btn
                    type="submit"
                    color="error"
                    variant="outlined"
                    size="large"
                    block
                    :loading="isTwoFactorLoading"
                  >
                    Disable Two-Factor Authentication
                  </v-btn>
                  <p v-if="twoFactorError" class="text-error text-sm mt-2">{{ twoFactorError }}</p>
                </v-form>
              </div>
            </div>
          </v-window-item>

          <!-- ACTIVE SESSIONS TAB -->
          <v-window-item value="sessions">
            <p class="text-body-2 text-medium-emphasis mb-4">
              These are the devices currently signed in to your account. You can sign out of any session.
            </p>

            <div v-if="isSessionsLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else-if="sessions.length === 0" class="text-center py-8">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-off-outline</v-icon>
              <p class="text-body-1 text-medium-emphasis">No active sessions found.</p>
            </div>

            <v-list v-else border rounded class="rounded-lg">
              <v-list-item
                v-for="sessionItem in sessions"
                :key="sessionItem.id"
                class="py-3"
              >
                <template #prepend>
                  <v-avatar color="grey-lighten-4" class="mr-3">
                    <v-icon color="grey">mdi-devices</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ sessionItem.userAgent || 'Unknown Device' }}
                  <v-chip
                    v-if="sessionItem.sessionToken === currentToken"
                    size="x-small"
                    color="success"
                    class="ml-2"
                  >
                    Current
                  </v-chip>
                </v-list-item-title>

                <v-list-item-subtitle class="mt-1">
                  <span class="d-block">IP: {{ sessionItem.ipAddress || 'Unknown' }}</span>
                  <span class="d-block">Created: {{ new Date(sessionItem.createdAt).toLocaleString() }}</span>
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    v-if="sessionItem.sessionToken !== currentToken"
                    color="error"
                    variant="outlined"
                    size="small"
                    :disabled="isSessionsLoading"
                    @click="revokeSession(sessionItem.sessionToken)"
                  >
                    Sign Out
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useFetch, useHead, useCookie } from 'nuxt/app'
import { authClient } from '../../../../lib/auth-client'
import { getAuthenticatorName } from '@better-auth/passkey'
// See twoFactor.vue for why this imports the specific submodule rather
// than the '@vueuse/integrations' barrel.
import { useQRCode } from '@vueuse/integrations/useQRCode'
import type {
  BetterAuthPasskey,
  BetterAuthSession,
  BetterAuthDeviceSession,
} from '../../../types'

useHead({
  title: 'Accessibility Settings'
})

// --- State ---
const activeTab = ref<string>('passkeys')
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Session
const session = ref<BetterAuthSession | null>(null)
const currentToken = ref('')

// Passkeys
const passkeys = ref<BetterAuthPasskey[]>([])
const newPasskeyName = ref<string>('')
const isPasskeyLoading = ref(false)

// Two-Factor
const twoFactorStep = ref<'password' | 'qr' | 'backup'>('password')
const twoFactorPassword = ref<string>('')
const totpCode = ref<string>('')
const backupCodes = ref<string[]>([])
const twoFactorData = ref<any>(null)
const twoFactorError = ref<string>('')
const isTwoFactorLoading = ref(false)
const disablePassword = ref<string>('')
const qrText = computed(() => twoFactorData.value?.totpURI || '')
const qrDataUrl = useQRCode(qrText)

// Sessions
const sessions = ref<BetterAuthDeviceSession[]>([])
const isSessionsLoading = ref(false)

// --- Load session ---
async function loadSession() {
  const {
    data: sessionData
  } = await useAuth().useSession(useFetch)
  session.value = (sessionData as any).value
  const cookie = useCookie('better-auth.session_token')
  currentToken.value = cookie.value || ''
}

// --- Passkeys ---
async function loadPasskeys() {
  isPasskeyLoading.value = true
  errorMsg.value = ''
  try {
    const { data } = await authClient.passkey.listUserPasskeys()
    passkeys.value = (data || []) as any[]
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to load passkeys'
  } finally {
    isPasskeyLoading.value = false
  }
}

async function addPasskey() {
  isPasskeyLoading.value = true
  errorMsg.value = ''
  try {
    const { error: err } = await authClient.passkey.addPasskey({
      name: newPasskeyName.value || undefined,
    })
    if (err) {
      errorMsg.value = err.message ?? 'Unknown error'
    } else {
      newPasskeyName.value = ''
      await loadPasskeys()
      successMsg.value = 'Passkey added successfully' as string | null
    }
  } catch (err: any) {
    errorMsg.value = (err.message || 'Failed to add passkey') as string
  } finally {
    isPasskeyLoading.value = false
  }
}

async function deletePasskey(id: string) {
  if (!confirm('Delete this passkey?')) return
  isPasskeyLoading.value = true
  errorMsg.value = ''
  try {
    const { error: err } = await authClient.passkey.deletePasskey({ id })
    if (err) {
      errorMsg.value = err.message ?? 'Unknown error'
    } else {
      await loadPasskeys()
      successMsg.value = 'Passkey deleted' as string | null
    }
  } catch (err: any) {
    errorMsg.value = (err.message || 'Failed to delete passkey') as string
  } finally {
    isPasskeyLoading.value = false
  }
}

// --- Two-Factor ---
async function enableTwoFactor() {
  isTwoFactorLoading.value = true
  twoFactorError.value = ''
  try {
    const { data, error: err } = await authClient.twoFactor.enable({
      password: twoFactorPassword.value,
    })
    if (err) {
      twoFactorError.value = err.message ?? 'Unknown error'
    } else if (data) {
      backupCodes.value = data.backupCodes ?? []
      twoFactorData.value = data
      twoFactorStep.value = 'qr'
    }
  } catch (err: any) {
    twoFactorError.value = (err.message || 'Failed to enable 2FA') as string
  } finally {
    isTwoFactorLoading.value = false
  }
}

async function verifyTwoFactor() {
  isTwoFactorLoading.value = true
  twoFactorError.value = ''
  try {
    const { data, error: err } = await authClient.twoFactor.verifyTotp({
      code: totpCode.value,
      trustDevice: true,
    })
    if (err) {
      twoFactorError.value = err.message ?? 'Unknown error'
    } else if (data) {
      twoFactorStep.value = 'backup'
      successMsg.value = 'Two-factor authentication enabled' as string | null
      await loadSession()
    }
  } catch (err: any) {
    twoFactorError.value = (err.message || 'Failed to verify code') as string
  } finally {
    isTwoFactorLoading.value = false
  }
}

async function disableTwoFactor() {
  isTwoFactorLoading.value = true
  twoFactorError.value = ''
  try {
    const { error: err } = await authClient.twoFactor.disable({
      password: disablePassword.value,
    })
    if (err) {
      twoFactorError.value = err.message ?? 'Unknown error'
    } else {
      successMsg.value = 'Two-factor authentication disabled' as string | null
      twoFactorStep.value = 'password'
      twoFactorPassword.value = ''
      disablePassword.value = ''
      await loadSession()
    }
  } catch (err: any) {
    twoFactorError.value = (err.message || 'Failed to disable 2FA') as string
  } finally {
    isTwoFactorLoading.value = false
  }
}

function dismissTwoFactorSuccess() {
  twoFactorStep.value = 'password'
  totpCode.value = ''
  backupCodes.value = []
  twoFactorData.value = null
}

// --- Sessions ---
async function loadSessions() {
  isSessionsLoading.value = true
  errorMsg.value = ''
  try {
    const { data } = await authClient.multiSession.listDeviceSessions()
    sessions.value = (data || []) as any[]
  } catch (err: any) {
    errorMsg.value = (err.message || 'Failed to load sessions') as string
  } finally {
    isSessionsLoading.value = false
  }
}

async function revokeSession(sessionToken: string) {
  if (!confirm('Sign out of this session?')) return
  isSessionsLoading.value = true
  errorMsg.value = ''
  try {
    const { error: err } = await authClient.multiSession.revoke({ sessionToken })
    if (err) {
      errorMsg.value = err.message ?? 'Unknown error'
    } else {
      successMsg.value = 'Session signed out' as string | null
      await loadSessions()
    }
  } catch (err: any) {
    errorMsg.value = (err.message || 'Failed to revoke session') as string
  } finally {
    isSessionsLoading.value = false
  }
}

// --- Init ---
function clearError() {
  errorMsg.value = null
}

function clearSuccess() {
  successMsg.value = null
}

onMounted(async () => {
  await loadSession()
  await loadPasskeys()
  await loadSessions()
})
</script>
