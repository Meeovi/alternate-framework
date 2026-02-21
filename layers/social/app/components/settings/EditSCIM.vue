<template>
  <UCard class="pa-4" elevation="1">
    <template #header>SCIM Settings</template>
    <template>
      <v-switch label="SCIM Enabled" v-model="form.scimEnabled" />
      <UInput label="Admin IDs (comma separated)" v-model="form.scimAdminIds" />
    </template>
    <template>
      <v-spacer />
      <UButton :loading="saving" color="primary" @click="save">Save</UButton>
      <div v-if="message" class="ml-3">{{ message }}</div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const form = ref({ scimEnabled: false, scimAdminIds: '' })
const saving = ref(false)
const message = ref('')

async function load() {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) return
    const data = await res.json()
    form.value.scimEnabled = !!data?.profile?.scimEnabled
    form.value.scimAdminIds = (data?.profile?.scimAdminIds || []).join(',')
  } catch (e) {}
}

async function save() {
  saving.value = true
  try {
    const payload = { scimEnabled: form.value.scimEnabled, scimAdminIds: form.value.scimAdminIds.split(',').map(s => s.trim()).filter(Boolean) }
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Save failed')
    message.value = 'Saved'
  } catch (e: any) { message.value = e?.message || 'Error' }
  finally { saving.value = false; setTimeout(() => (message.value = ''), 2500) }
}

onMounted(load)
</script>

<style scoped>
.ml-3 { margin-left: 0.75rem }
</style>
