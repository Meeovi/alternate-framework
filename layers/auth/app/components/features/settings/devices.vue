<!-- pages/devices.vue -->
<template>
  <v-container class="max-width-600 my-8">
    <v-card elevation="2" rounded="lg">
      <v-toolbar color="primary" class="text-white" flat>
        <v-icon start class="ml-4">fas fa-mobile-screen-button</v-icon>
        <v-toolbar-title>Device Authorization</v-toolbar-title>
      </v-toolbar>

      <v-tabs v-model="activeTab" bg-color="grey-lighten-4" color="primary" grow>
        <v-tab value="verify">Authorize Code</v-tab>
        <v-tab value="request">Request Link</v-tab>
      </v-tabs>

      <v-card-text class="pa-6">
        <!-- Global Alert Handlers -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" closable class="mb-4" @click:close="errorMsg = null">
          {{ errorMsg }}
        </v-alert>
        <v-alert v-if="successMsg" type="success" variant="tonal" closable class="mb-4" @click:close="successMsg = null">
          {{ successMsg }}
        </v-alert>

        <v-window v-model="activeTab">
          <!-- WINDOW 1: INPUT CODE & APPROVE (USER AGENT) -->
          <v-window-item value="verify">
            <div v-if="!pendingVerification">
              <p class="text-body-1 mb-4 text-medium-emphasis">
                Enter the authorization code displayed on your other device or terminal to grant it access.
              </p>
              <v-form @submit.prevent="handleVerifyCode">
                <v-text-field
                  v-model="inputCode"
                  label="Device Code"
                  placeholder="ABCD-EFGH"
                  variant="outlined"
                  maxlength="12"
                  :disabled="isProcessing"
                  persistent-placeholder
                  class="mb-2"
                />
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  size="large"
                  :loading="isProcessing"
                >
                  Continue
                </v-btn>
              </v-form>
            </div>

            <!-- Validation/Decision State -->
            <div v-else class="text-center py-4">
              <v-icon size="64" color="warning" class="mb-3">fas fa-triangle-exclamation</v-icon>
              <h3 class="text-h6 mb-2">Device Requesting Access</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">
                A device is requesting authorization to connect to your account. Please confirm the code matches.
              </p>

              <v-sheet border rounded class="pa-4 bg-grey-lighten-4 text-h4 font-weight-bold mb-6 letter-spacing-1">
                {{ inputCode.toUpperCase() }}
              </v-sheet>

              <div class="d-flex gap-4 justify-center">
                <v-btn
                  color="error"
                  variant="outlined"
                  size="large"
                  :disabled="isProcessing"
                  @click="handleDeny"
                  class="mr-3"
                >
                  Deny
                </v-btn>
                <v-btn
                  color="success"
                  size="large"
                  :loading="isProcessing"
                  @click="handleApprove"
                >
                  Approve & Link
                </v-btn>
              </div>
            </div>
          </v-window-item>

          <!-- WINDOW 2: REQUEST ACCESS (CLIENT AGENT) -->
          <v-window-item value="request">
            <div v-if="!deviceCodeData" class="text-center py-6">
              <p class="text-body-1 mb-6 text-medium-emphasis">
                Need to authorize this browser as a headless client? Generate a code below.
              </p>
              <v-btn
                color="primary"
                size="large"
                :loading="isProcessing"
                @click="handleRequestCode"
              >
                Generate Device Code
              </v-btn>
            </div>

            <!-- Generated code displays + polling state -->
            <div v-else class="text-center py-4">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
                class="mb-4"
              />
              <h3 class="text-h6 mb-1">Waiting for Authorization</h3>
              <p class="text-body-2 text-medium-emphasis mb-6">
                Please visit the link below on your main browser or scan to authorize this device.
              </p>

              <v-sheet border rounded class="pa-4 bg-grey-lighten-4 mb-4">
                <div class="text-caption text-uppercase text-medium-emphasis font-weight-bold">Your Verification Code</div>
                <div class="text-h3 font-weight-bold my-2">{{ deviceCodeData.userCode }}</div>
              </v-sheet>

              <v-card variant="outlined" class="text-left mb-6">
                <v-card-text class="d-flex align-center justify-space-between py-3">
                  <div>
                    <div class="text-caption text-medium-emphasis">Verification Link</div>
                    <a :href="deviceCodeData.verificationUriComplete || deviceCodeData.verificationUri" target="_blank" class="text-decoration-none font-weight-medium">
                      {{ deviceCodeData.verificationUri }}
                    </a>
                  </div>
                  <v-btn icon="fas fa-copy" variant="text" size="small" @click="copyToClipboard" />
                </v-card-text>
              </v-card>

              <v-btn variant="text" color="error" @click="handleCancelRequest">
                Cancel Request
              </v-btn>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDeviceAuth } from '../../../composables/device/useDeviceAuth'

const activeTab = ref('verify')
const inputCode = ref('')
const pendingVerification = ref(false)

const {
  isProcessing,
  errorMsg,
  successMsg,
  deviceCodeData,
  requestDeviceCode,
  stopPolling,
  submitUserCode,
  approveDevice,
  denyDevice
} = useDeviceAuth()

// Reset states when swapping modes
watch(activeTab, () => {
  stopPolling()
  deviceCodeData.value = null
  pendingVerification.value = false
  inputCode.value = ''
  errorMsg.value = null
  successMsg.value = null
})

// Tab 1 UI Handlers
const handleVerifyCode = async () => {
  if (!inputCode.value) return
  
  const verifiedData = await submitUserCode(inputCode.value)
  if (verifiedData) {
    pendingVerification.value = true
  }
}

const handleApprove = async () => {
  const ok = await approveDevice(inputCode.value)
  if (ok) {
    pendingVerification.value = false
    inputCode.value = ''
  }
}

const handleDeny = async () => {
  const ok = await denyDevice(inputCode.value)
  if (ok) {
    pendingVerification.value = false
    inputCode.value = ''
  }
}

// Tab 2 UI Handlers
const handleRequestCode = () => {
  requestDeviceCode('your-client-id') // Pass your actual Better Auth client-id configured on your server
}

const handleCancelRequest = () => {
  stopPolling()
  deviceCodeData.value = null
}

const copyToClipboard = () => {
  if (!deviceCodeData.value) return
  const url = deviceCodeData.value.verificationUriComplete || deviceCodeData.value.verificationUri
  navigator.clipboard.writeText(url)
}
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}
.letter-spacing-1 {
  letter-spacing: 2px;
}
</style>