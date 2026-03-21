<template>
  <v-card class="pa-4" elevation="1">
    <template #header>Profile</template>
    <template #header>
      <v-text-field label="Name" v-model="form.name" />
      <v-text-field label="Email" v-model="form.email" type="email" />
    </template>
    <template>
      <v-spacer />
      <v-btn :loading="saving" color="primary" @click="save">Save</v-btn>
      <div v-if="message" class="ml-3">{{ message }}</div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from '#imports'

const form = ref({ name: '', email: '' })
const saving = ref(false)
const message = ref('')

async function load() {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) return
    const data = await res.json()
    form.value.name = data?.profile?.name || ''
    form.value.email = data?.profile?.email || ''
  } catch (e) {}
}

async function save() {
  saving.value = true
  try {
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form.value) })
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
