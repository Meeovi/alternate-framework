<template>
  <UCard class="pa-4" elevation="1">
    <template #header>JWT Settings</template>
    <template #header>
      <UTextarea label="Signing Key" v-model="form.jwtKey" rows="4" />
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

const form = ref({ jwtKey: '' })
const saving = ref(false)
const message = ref('')

async function load() {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) return
    const data = await res.json()
    form.value.jwtKey = data?.profile?.jwtKey || ''
  } catch (e) {}
}

async function save() {
  saving.value = true
  try {
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jwtKey: form.value.jwtKey }) })
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
