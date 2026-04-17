<template>
  <section class="auth-profile-editor">
    <h3>Profile</h3>
    <v-form @submit.prevent="save">
      <label>
        Name
        <input v-model="form.name" type="text" />
      </label>
      <label>
        Email
        <input v-model="form.email" type="email" />
      </label>
      <div class="actions">
        <v-btn type="submit" :disabled="saving">Save</v-btn>
        <span v-if="message" class="message">{{ message }}</span>
      </div>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const form = ref({ name: '', email: '' })
const saving = ref(false)
const message = ref('')

async function load() {
  try {
    const res = await fetch('/api/profile')
    if (!res.ok) throw new Error('Unauthorized')
    const data = await res.json()
    form.value.name = data?.profile?.name || ''
    form.value.email = data?.profile?.email || ''
  } catch {
    // Silently fail to allow mounting in guest screens.
  }
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) throw new Error('Failed to save')
    message.value = 'Saved'
  } catch (err: any) {
    message.value = err?.message || 'Error'
  } finally {
    saving.value = false
    setTimeout(() => (message.value = ''), 3000)
  }
}

onMounted(load)
</script>

<style scoped>
.auth-profile-editor { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 6px }
.auth-profile-editor label { display: block; margin-bottom: 0.5rem }
.auth-profile-editor input { width: 100%; padding: 0.35rem; margin-top: 0.25rem }
.actions { margin-top: 0.5rem }
.message { margin-left: 0.5rem; color: #059669 }
</style>
