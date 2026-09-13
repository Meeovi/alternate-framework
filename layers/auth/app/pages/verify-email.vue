<template>
  <div class="auth-content">
    <v-card class="auth-card" elevation="0">
      <v-card-title class="text-h5">Verify your email</v-card-title>
      <v-card-subtitle>
        One more step before you can sign in.
      </v-card-subtitle>

      <v-card-text>
        <p class="mb-4">
          We've sent a verification link to
          <strong>{{ email || 'your email address' }}</strong>.
          Open it to confirm your account, then come back and sign in.
        </p>

        <v-alert v-if="message" :type="messageType" variant="tonal" closable class="mb-4"
          @click:close="message = ''">
          {{ message }}
        </v-alert>

        <v-btn block color="primary" size="large" class="mb-3" to="/login">
          Go to Sign In
        </v-btn>

        <div class="text-center">
          <span class="text-caption">Didn't get the email?</span>
          <v-btn variant="text" size="small" :loading="loading" :disabled="loading || !email"
            @click="resend">
            Resend link
          </v-btn>
        </div>

        <p v-if="!email" class="text-caption text-medium-emphasis text-center mt-2">
          Reopen this page from the registration form to resend, or just
          sign in to trigger a fresh link.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useRoute } from '#imports'
import { authClient } from '../../lib/auth-client'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Verify your email',
})

const route = useRoute()
const email = computed(() => {
  const q = route.query.email
  return typeof q === 'string' ? q : ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

async function resend() {
  if (loading.value || !email.value) return
  loading.value = true
  message.value = ''
  try {
    const { error } = await (authClient as any).sendVerificationEmail({
      email: email.value,
      callbackURL: '/login?verified=1',
    })
    if (error) {
      messageType.value = 'error'
      message.value = error.message || 'Could not resend the verification email.'
    } else {
      messageType.value = 'success'
      message.value = 'Verification email sent. Check your inbox.'
    }
  } catch {
    messageType.value = 'error'
    message.value = 'Could not resend the verification email.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: white !important;
  border-radius: 12px;
}
</style>
