<template>
  <div class="auth-content">
    <v-card class="auth-card" elevation="0">
      <v-card-title class="text-h5">Two-step verification</v-card-title>
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>

      <v-card-text>
        <v-alert v-if="message" :type="messageType" class="mb-4" variant="tonal" closable @click:close="message = ''">
          {{ message }}
          <template v-if="expired">
            <NuxtLink :to="{ path: '/login', query: redirectQuery }">Sign in again</NuxtLink>.
          </template>
        </v-alert>

        <v-form @submit.prevent="verify">
          <v-text-field
            v-model="code"
            :label="method === 'backup' ? 'Backup code' : 'Verification code'"
            :autocomplete="method === 'backup' ? 'off' : 'one-time-code'"
            :inputmode="method === 'backup' ? 'text' : 'numeric'"
            variant="outlined"
            autofocus
            required
          />
          <v-checkbox v-model="trustDevice" label="Trust this device for 30 days" density="compact" class="my-0" />
          <v-btn type="submit" block color="primary" size="large" :loading="loading" :disabled="loading || !code.trim()">
            Verify
          </v-btn>
        </v-form>

        <div class="d-flex flex-column align-center mt-4 ga-1 text-caption">
          <a v-if="method !== 'totp'" href="#" @click.prevent="useMethod('totp')">Use your authenticator app</a>
          <a v-if="method !== 'otp'" href="#" @click.prevent="useMethod('otp')">Email me a code instead</a>
          <a v-if="method === 'otp'" href="#" @click.prevent="sendEmailCode">Send another code</a>
          <a v-if="method !== 'backup'" href="#" @click.prevent="useMethod('backup')">Use a backup code</a>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import { authClient } from '../../lib/auth-client'
import { safeRedirectPath } from '../utils/safeRedirectPath'

// Second step of a password sign-in for accounts with 2FA on. better-auth
// answers the password step with `twoFactorRedirect` and a short-lived
// two-factor cookie (no session yet); twoFactorClient's onTwoFactorRedirect
// (lib/auth-client.ts) sends the browser here, keeping ?redirect=.
definePageMeta({
  layout: 'auth',
})

useHead({ title: 'Two-step verification' })

type Method = 'totp' | 'otp' | 'backup'

const route = useRoute()
const redirectTarget = computed(() => safeRedirectPath(route.query.redirect))
const redirectQuery = computed(() => (redirectTarget.value === '/' ? {} : { redirect: redirectTarget.value }))

const method = ref<Method>('totp')
const code = ref('')
const trustDevice = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('error')
const expired = ref(false)

const subtitle = computed(() => ({
  totp: 'Enter the 6-digit code from your authenticator app.',
  otp: 'Enter the code we emailed you.',
  backup: 'Enter one of your backup codes. Each code works once.',
}[method.value]))

function showError(error: { message?: string, code?: string, status?: number }) {
  messageType.value = 'error'
  // No (or an expired) two-factor cookie: the password step has to be redone.
  expired.value = error.status === 401 && /two.?factor|cookie/i.test(`${error.code} ${error.message}`)
  message.value = expired.value ? 'This sign-in has expired.' : (error.message || 'That code didn\'t work. Try again.')
}

async function sendEmailCode() {
  message.value = ''
  const { error } = await authClient.twoFactor.sendOtp()
  if (error) return showError(error)
  messageType.value = 'info'
  message.value = 'We\'ve emailed you a code.'
}

async function useMethod(next: Method) {
  method.value = next
  code.value = ''
  message.value = ''
  if (next === 'otp') await sendEmailCode()
}

async function verify() {
  if (loading.value || !code.value.trim()) return
  loading.value = true
  message.value = ''
  try {
    const input = { code: code.value.trim(), trustDevice: trustDevice.value }
    const { error } = method.value === 'totp'
      ? await authClient.twoFactor.verifyTotp(input)
      : method.value === 'otp'
        ? await authClient.twoFactor.verifyOtp(input)
        : await authClient.twoFactor.verifyBackupCode(input)
    if (error) return showError(error)
    messageType.value = 'success'
    message.value = 'Verified — signing you in…'
    await navigateTo(redirectTarget.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
  .auth-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: white !important;
    border-radius: 12px;
  }
</style>
