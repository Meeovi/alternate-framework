<template>
  <div class="auth-content">
    <v-card class="auth-card" elevation="0">
      <v-card-title class="text-h5">Reset Password</v-card-title>

      <v-card-text class="reset-password-form">
        <v-form class="mbr-section-btn" :schema="schema" :state="state">
          <v-text-field v-model="state.password" type="password" label="New Password" required></v-text-field>
          <v-text-field v-model="state.confirmPassword" type="password" label="Confirm Password" required></v-text-field>
          <v-btn class="mt-2" type="submit" block @click="handleResetPassword" :loading="loading" :disabled="loading">
            Reset Password
          </v-btn>
        </v-form>
      </v-card-text>

      <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal">
        {{ message }}
      </v-alert>

      <div class="mt-4 text-center">
        <NuxtLink to="/login">Back to Login</NuxtLink>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#app'
import { z } from 'zod'
import { reactive, ref } from 'vue'
import { useAlert } from '../composables/useAlert'
import { authClient } from '../../lib/auth-client'

definePageMeta({
  layout: 'auth',
  auth: {
    only: 'guest'
  }
})

useHead({
  title: 'Reset Password'
})

const alert = useAlert()
const runtimeConfig = useRuntimeConfig()
const appName = String(runtimeConfig.public?.appName || 'App')

const state = reactive({
  password: '',
  confirmPassword: ''
})

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters').refine(val => val === state.password, {
    message: 'Passwords do not match'
  })
})

const loading = ref(false)

// reactive message used by the template's v-alert
const message = ref<string | null>(null)
const messageType = ref<'info' | 'success' | 'error' | 'warning'>('info')
const handleResetPassword = async () => {
  if (state.confirmPassword !== state.password) {
    alert.error('Please enter matching passwords');
		return;
	}

  loading.value = true
  message.value = null

  await (authClient as any).resetPassword({
    newPassword: state.password,
		fetchOptions: {
      onSuccess() {
        messageType.value = 'success'
        message.value = 'Your password has been reset. Redirecting to login.'
        navigateTo('/login')
			},
      onError(context: any) {
        messageType.value = 'error'
        message.value = context.error.message;
			},
		},
	});

  loading.value = false
};
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
    max-width: 400px;
    background: white !important;
    border-radius: 12px;
  }

  .message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 4px;
  }
</style>