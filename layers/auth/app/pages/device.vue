<template>
  <div class="login-form">
    <v-card class="login-card" elevation="0">
      <v-card-title class="pb-2">
        <h2 class="text-h5 font-weight-600">Device sign-in</h2>
      </v-card-title>
      <v-card-subtitle class="pb-4">Enter the code shown on your other device.</v-card-subtitle>

      <v-card-text class="pt-4">
        <v-alert v-if="alertMessage" :type="alertType" variant="tonal" closable class="mb-4" @click:close="alertMessage = ''">
          {{ alertMessage }}
        </v-alert>

        <template v-if="status === 'idle'">
          <v-form @submit.prevent="checkCode">
            <v-text-field
              v-model="userCode"
              label="Device code"
              placeholder="XXXX-XXXX"
              required
              variant="outlined"
              class="mb-4"
            />
            <v-btn type="submit" color="primary" block :loading="loading">Continue</v-btn>
          </v-form>
        </template>

        <template v-else-if="status === 'confirm'">
          <p class="mb-4">Approve sign-in for code <strong>{{ userCode }}</strong>?</p>
          <div class="d-flex ga-2">
            <v-btn color="primary" :loading="loading" @click="approve">Approve</v-btn>
            <v-btn variant="outlined" :loading="loading" @click="deny">Deny</v-btn>
          </div>
        </template>

        <template v-else-if="status === 'done'">
          <p>{{ alertMessage }}</p>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
// Real RFC 8628 device-authorization verification page — the
// deviceAuthorization() plugin (shared/utils/plugins.ts) was previously
// configured with verificationUri: "/device", but this page never
// existed, so a device-flow client's displayed "go to this URL" link
// always 404'd. Calls the plugin's own real endpoints directly
// (/api/auth/device, /api/auth/device/approve, /api/auth/device/deny) —
// the same paths deviceAuthorizationClient() wraps client-side.
import { ref } from '#imports'

// /device/approve and /device/deny both require an authenticated session
// server-side — gate the whole page the same way the rest of this layer
// gates authenticated-only pages, rather than letting a signed-out visitor
// reach the approve/deny step only to have it fail.
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userCode = ref(typeof route.query.user_code === 'string' ? route.query.user_code : '')
const status = ref('idle')
const loading = ref(false)
const alertMessage = ref('')
const alertType = ref('info')

async function checkCode() {
  if (!userCode.value.trim()) return
  loading.value = true
  alertMessage.value = ''
  try {
    await $fetch('/api/auth/device', { params: { user_code: userCode.value.trim() } })
    status.value = 'confirm'
  } catch (error) {
    alertType.value = 'error'
    alertMessage.value = error?.data?.error_description || 'That code is invalid or has expired.'
  } finally {
    loading.value = false
  }
}

async function approve() {
  loading.value = true
  try {
    await $fetch('/api/auth/device/approve', { method: 'POST', body: { userCode: userCode.value.trim() } })
    status.value = 'done'
    alertType.value = 'success'
    alertMessage.value = 'Device approved — you can return to it now.'
  } catch (error) {
    alertType.value = 'error'
    alertMessage.value = error?.data?.error_description || 'Failed to approve device.'
  } finally {
    loading.value = false
  }
}

async function deny() {
  loading.value = true
  try {
    await $fetch('/api/auth/device/deny', { method: 'POST', body: { userCode: userCode.value.trim() } })
    status.value = 'done'
    alertType.value = 'info'
    alertMessage.value = 'Device sign-in denied.'
  } catch (error) {
    alertType.value = 'error'
    alertMessage.value = error?.data?.error_description || 'Failed to deny device.'
  } finally {
    loading.value = false
  }
}
</script>
