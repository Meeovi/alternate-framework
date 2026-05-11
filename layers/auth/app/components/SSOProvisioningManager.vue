<template>
  <section v-if="shouldRender" class="sso-provision-manager">
    <h3>SSO Provisioning</h3>
    <div v-if="!isSupported">
      <p class="message-muted">SSO provisioning is not available for the current auth backend ({{ backendLabel }}).</p>
    </div>
    <div v-else>
      <p>Start SSO with a configured provider.</p>
      <v-btn
        v-for="provider in providers"
        :key="provider"
        @click="provision(provider)"
        :disabled="saving"
        variant="text"
        class="mr-2">
        Continue with {{ formatProvider(provider) }}
      </v-btn>
      <span v-if="message" class="message">{{ message }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthCapabilities } from '../composables/useAuthCapabilities'

const props = withDefaults(defineProps<{
  enabled?: boolean
  showUnsupportedState?: boolean
  providers?: string[]
  callbackURL?: string
}>(), {
  enabled: true,
  showUnsupportedState: false,
  providers: () => ['google'],
  callbackURL: '/',
})

const auth = useAuth()
const { backend, hasSso } = useAuthCapabilities()
const isSupported = computed(() => hasSso.value)
const backendLabel = computed(() => backend.value)
const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

const saving = ref(false)
const message = ref('')

function formatProvider(provider: string) {
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

async function provision(provider: string) {
  if (!isSupported.value) return

  saving.value = true
  message.value = ''
  try {
    await (auth.signIn as any).social({ provider, callbackURL: props.callbackURL })
    message.value = `Starting SSO with ${formatProvider(provider)}`
  } catch (e: any) {
    message.value = e?.message || 'Error'
  } finally {
    saving.value = false
    setTimeout(() => (message.value = ''), 3000)
  }
}
</script>

<style scoped>
.sso-provision-manager { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 6px }
.message { margin-left: 0.5rem; color: #059669 }
.message-muted { color: #6b7280 }
</style>
