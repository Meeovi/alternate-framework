<template>
  <section class="sso-provision-manager">
    <h3>SSO Provisioning</h3>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <p>SSO provisioned: <strong>{{ profile?.ssoProvisioned ? 'Yes' : 'No' }}</strong></p>
      <v-btn @click="provision" :disabled="saving || profile?.ssoProvisioned">Provision Now</v-btn>
      <span v-if="message" class="message">{{ message }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from '#imports'

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const profile = ref<any>(null)

async function load() {
  loading.value = true
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) throw new Error('Unauthorized')
    const data = await res.json()
    profile.value = data?.profile || null
  } catch (e) {
    profile.value = null
  } finally { loading.value = false }
}

async function provision() {
  saving.value = true
  message.value = ''
  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ssoProvisioned: true })
    })
    if (!res.ok) throw new Error('Provision failed')
    message.value = 'Provisioned'
    await load()
  } catch (e: any) {
    message.value = e?.message || 'Error'
  } finally { saving.value = false; setTimeout(() => (message.value = ''), 3000) }
}

onMounted(load)
</script>

<style scoped>
.sso-provision-manager { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 6px }
.message { margin-left: 0.5rem; color: #059669 }
</style>
