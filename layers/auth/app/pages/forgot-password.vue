<template>
  <div class="auth-content">
    <v-card class="auth-card" elevation="0">
      <v-card-title class="text-h5">Forgot Password</v-card-title>
      <v-card-subtitle>Enter your email address to receive a password reset link.</v-card-subtitle>

      <v-card-text>
        <div class="request-reset-form">
          <v-form class="mbr-section-btn" :schema="schema" :state="state">
            <v-text-field v-model="state.email" type="email" label="Email" required></v-text-field>
            <NuxtTurnstile v-if="captchaEnabled" ref="captchaWidget" v-model="captchaToken" class="mt-2" />
            <v-btn class="mt-2" type="submit" block @click="handleForgetPassword" :loading="loading" :disabled="loading || captchaMissing">
              Send Reset Link
            </v-btn>
          </v-form>
        </div>

        <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal" closable>
          {{ message }}
        </v-alert>

        <div class="mt-4 text-center">
          <p>Remember your password?
            <NuxtLink to="/login">Sign In</NuxtLink>
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#imports'
import { z } from 'zod'
import { reactive, ref } from 'vue'
import { authClient } from '../../lib/auth-client'

definePageMeta({
  layout: 'auth',
  auth: {
    only: 'guest'
  }
})

useHead({
  title: 'Forgot Password'
})

const runtimeConfig = useRuntimeConfig()
const { captchaEnabled, captchaToken, captchaWidget, captchaMissing, captchaFetchOptions, resetCaptcha } = useAuthCaptcha()
const appName = String(runtimeConfig.public?.appName || 'App')

const schema = z.object({
  email: z.string().email('Invalid email address')
})

const state = reactive({
  email: ''
})

const loading = ref(false)

// expose message and messageType used by the template v-alert
const message = ref<string | null>(null)
const messageType = ref<'info' | 'success' | 'error' | 'warning' | undefined>(undefined)

const handleForgetPassword = async () => {
  if (!state.email) {
    messageType.value = 'error'
    message.value = 'Please enter your email address'
		return;
	}
  loading.value = true
  message.value = null
  // POST /request-password-reset — the old forgetPassword() client call
  // targeted /forget-password, which this better-auth version no longer has.
  await authClient.requestPasswordReset(
		{
      email: state.email,
			redirectTo: "/reset-password",
		},
		{
      ...captchaFetchOptions(),
			onSuccess() {
        messageType.value = 'success'
        message.value = 'Password reset link sent to your email.'
			},
      onError(context: any) {
        messageType.value = 'error'
        message.value = context.error.message;
			},
		},
	);
  resetCaptcha()
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

  .v-alert {
    margin-top: 1rem;
  }

  .text-center {
    text-align: center;
  }

  .mt-4 {
    margin-top: 1rem;
  }
</style>