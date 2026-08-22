<!-- pages/settings/ott.vue -->
<template>
  <v-container class="max-width-600 my-8">
    <v-card elevation="2" rounded="lg">
      <v-toolbar color="teal" class="text-white" flat>
        <v-icon start class="ml-4">fas fa-ticket</v-icon>
        <v-toolbar-title>One-Time Token Setup (OTT)</v-toolbar-title>
      </v-toolbar>

      <v-tabs v-model="activeTab" bg-color="grey-lighten-4" color="teal" grow>
        <v-tab value="generate">Generate Token</v-tab>
        <v-tab value="verify">Redeem Token</v-tab>
      </v-tabs>

      <v-card-text class="pa-6">
        <!-- Error / Success Alerts -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4" closable @click:close="errorMsg = null">
          {{ errorMsg }}
        </v-alert>
        <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4" closable @click:close="successMsg = null">
          {{ successMsg }}
        </v-alert>

        <v-window v-model="activeTab">
          <!-- WINDOW 1: GENERATE OTT -->
          <v-window-item value="generate">
            <p class="text-body-1 mb-6 text-medium-emphasis">
              Generate a short-lived single-use token to securely share your active authentication session with external apps or microservices.
            </p>

            <div v-if="!generatedToken" class="text-center py-4">
              <v-btn
                color="teal"
                size="large"
                prepend-icon="fas fa-key"
                :loading="isProcessing"
                @click="generateToken"
              >
                Create Single-Use Token
              </v-btn>
            </div>

            <div v-else>
              <v-sheet border rounded class="pa-4 bg-teal-lighten-5 border-teal mb-4 text-center">
                <div class="text-caption text-uppercase font-weight-bold text-teal-darken-2">Active Single-Use Token</div>
                <div class="text-h5 font-weight-mono font-weight-bold my-2 select-all">{{ generatedToken }}</div>
                <div class="text-caption text-grey">Expires in 3 minutes. Can only be redeemed once.</div>
              </v-sheet>

              <div class="d-flex gap-4">
                <v-btn
                  variant="outlined"
                  color="teal"
                  block
                  prepend-icon="fas fa-copy"
                  @click="copyToken"
                >
                  Copy Token
                </v-btn>
              </div>
            </div>
          </v-window-item>

          <!-- WINDOW 2: REDEEM/VERIFY OTT -->
          <v-window-item value="verify">
            <p class="text-body-1 mb-4 text-medium-emphasis">
              Provide an external one-time token to test local session validation and redeem it.
            </p>

            <v-form v-if="!verifiedSession" @submit.prevent="handleVerify">
              <v-text-field
                v-model="inputToken"
                label="Paste Token"
                placeholder="Paste OTT string here..."
                variant="outlined"
                :disabled="isProcessing"
                class="mb-2"
              />
              <v-btn
                type="submit"
                color="teal"
                block
                size="large"
                :loading="isProcessing"
              >
                Verify & Redeem Token
              </v-btn>
            </v-form>

            <div v-else class="text-center py-4">
              <v-icon size="64" color="success" class="mb-3">fas fa-circle-check</v-icon>
              <h3 class="text-h6 mb-2">Token Redeemed Successfully</h3>
              
              <v-sheet border rounded class="pa-4 text-left bg-grey-lighten-4 mb-6">
                <div class="text-caption font-weight-bold text-medium-emphasis">Associated User Details:</div>
                <pre class="text-caption font-weight-mono mt-2 overflow-x-auto">{{ JSON.stringify(verifiedSession.user, null, 2) }}</pre>
              </v-sheet>

              <v-btn variant="outlined" color="teal" @click="verifiedSession = null; inputToken = ''">
                Verify Another Token
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
import { useOneTimeToken } from '../../../composables/plugins/useOneTimeToken'

const activeTab = ref('generate')
const inputToken = ref('')

const {
  isProcessing,
  errorMsg,
  successMsg,
  generatedToken,
  verifiedSession,
  generateToken,
  verifyToken
} = useOneTimeToken()

// Reset status context switching tabs
watch(activeTab, () => {
  generatedToken.value = null
  verifiedSession.value = null
  inputToken.value = ''
  errorMsg.value = null
  successMsg.value = null
})

const handleVerify = () => {
  if (!inputToken.value.trim()) return
  verifyToken(inputToken.value.trim())
}

const copyToken = () => {
  if (!generatedToken.value) return
  navigator.clipboard.writeText(generatedToken.value)
}
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}
.font-weight-mono {
  font-family: monospace;
}
.select-all {
  user-select: all;
}
</style>