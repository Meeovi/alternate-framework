<template>
  <section v-if="shouldRender" class="auth-profile-editor">
    <h3>Profile</h3>
    <p v-if="!isSupported" class="message-muted">
      Profile editing is not available for the current auth backend ({{ backendLabel }}).
    </p>

    <v-form v-else @submit.prevent="save">
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
import { useAuthCapabilities } from '../composables/useAuthCapabilities'

const props = withDefaults(defineProps<{
  enabled?: boolean
  showUnsupportedState?: boolean
}>(), {
  enabled: true,
  showUnsupportedState: false,
})

const auth = useAuth()
const { backend, hasProfileUpdate } = useAuthCapabilities()
const isSupported = computed(() => hasProfileUpdate.value)
const backendLabel = computed(() => backend.value)
const shouldRender = computed(() => props.enabled && (isSupported.value || props.showUnsupportedState))

const form = ref({ name: '', email: '' })
const saving = ref(false)
const message = ref('')
const loading = ref(false)

async function load() {
  if (!isSupported.value) return

  loading.value = true
  try {
    await auth.fetchSession()
    form.value.name = auth.user.value?.name || ''
    form.value.email = auth.user.value?.email || ''
  } catch {
    // Silently fail to allow mounting in guest screens.
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!isSupported.value) return

  saving.value = true
  message.value = ''
  try {
    const updateUser = (auth.client as any)?.updateUser
    if (typeof updateUser !== 'function') {
      throw new Error('Profile update is not supported')
    }

    const { error } = await updateUser({ name: form.value.name, email: form.value.email })
    if (error) throw error
    await auth.fetchSession()
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
.message-muted { color: #6b7280 }
</style>
