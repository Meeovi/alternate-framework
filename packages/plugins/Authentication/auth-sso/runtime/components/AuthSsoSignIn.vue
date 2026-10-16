<template>
  <section class="auth-sso">
    <p class="text-body-2 text-medium-emphasis mb-3">
      Sign in through your organization's identity provider. Enter your work email and you'll be sent to it.
    </p>
    <form class="d-flex flex-wrap ga-2 align-start" @submit.prevent="start">
      <v-text-field
        v-model="email"
        type="email"
        label="Work email"
        autocomplete="email"
        density="comfortable"
        hide-details="auto"
        :error-messages="error ? [error] : []"
        class="auth-sso__email"
        required />
      <v-btn type="submit" color="primary" :loading="loading" :disabled="!email.trim()">
        Continue with SSO
      </v-btn>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Starts better-auth's SSO flow (POST /api/auth/sign-in/sso). The email's
 * domain picks the identity provider registered for it; the response holds
 * the provider's sign-in URL.
 */
const props = withDefaults(defineProps<{ callbackURL?: string }>(), { callbackURL: '/' })

const email = ref('')
const loading = ref(false)
const error = ref('')

async function start() {
  loading.value = true
  error.value = ''
  try {
    const result = await $fetch<{ url?: string }>('/api/auth/sign-in/sso', {
      method: 'POST',
      body: { email: email.value.trim(), callbackURL: props.callbackURL },
    })
    if (!result?.url) throw new Error('No identity provider is set up for that email.')
    window.location.href = result.url
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Could not start single sign-on.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-sso__email {
  flex: 1 1 260px;
}
</style>
