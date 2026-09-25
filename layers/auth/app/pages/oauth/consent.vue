<template>
  <v-container class="py-10" max-width="520">
    <v-card>
      <v-card-title class="text-wrap">
        {{ clientName }} wants to use your Meeovi account
      </v-card-title>
      <v-card-text>
        <p class="mb-3">It will be able to:</p>
        <v-list density="compact">
          <v-list-item v-for="scope in scopes" :key="scope" :title="scopeLabel(scope)" prepend-icon="fas fa-check" />
        </v-list>
        <v-alert v-if="error" type="error" variant="tonal" class="mt-4">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="busy" @click="respond(false)">Deny</v-btn>
        <v-btn color="primary" variant="flat" :loading="busy" @click="respond(true)">Allow</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { authClient } from '../../../lib/auth-client'

/**
 * Consent screen for @better-auth/oauth-provider (consentPage in
 * shared/utils/plugins.ts). First-party clients like Pixanomy are
 * registered with skip_consent and never land here. authClient's
 * oauthProviderClient plugin attaches this page's signed query to the
 * POST, which is how the server knows which authorization to continue.
 */
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Authorize app' })

const route = useRoute()
const clientId = String(route.query.client_id || '')
const scopes = String(route.query.scope || 'openid').split(' ').filter(Boolean)
const clientName = ref(clientId || 'An application')
const busy = ref(false)
const error = ref('')

const LABELS: Record<string, string> = {
  openid: 'Confirm who you are',
  profile: 'See your name and profile picture',
  email: 'See your email address',
  offline_access: 'Stay signed in when you are not using it',
}
const scopeLabel = (scope: string) => LABELS[scope] || scope

onMounted(async () => {
  if (!clientId) return
  const { data } = await authClient.$fetch<{ client_name?: string }>('/oauth2/public-client', {
    method: 'GET',
    query: { client_id: clientId },
  })
  if (data?.client_name) clientName.value = data.client_name
})

async function respond(accept: boolean) {
  busy.value = true
  error.value = ''
  const { data, error: err } = await authClient.$fetch<{ redirect_uri?: string, url?: string }>('/oauth2/consent', {
    method: 'POST',
    body: { accept },
  })
  const target = data?.redirect_uri || data?.url
  if (target) {
    window.location.href = target
    return
  }
  error.value = err?.message || 'Something went wrong. Please try again.'
  busy.value = false
}
</script>
