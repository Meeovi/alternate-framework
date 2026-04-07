<template>
  <div class="authPage">
    <section data-bs-version="5.1" class="authForm">
      <NuxtImg loading="lazy" src="~/assets/images/logo512alpha-128x128.png" :alt="appName" class="authLogo" />
      <h1 class="mbr-section-title mbr-fonts-style display-1">Reset Password</h1>

      <div class="reset-password-form">
        <v-form class="mbr-section-btn" :schema="schema" :state="state">
          <v-text-field v-model="state.password" type="password" label="New Password" required></v-text-field>
          <v-text-field v-model="state.confirmPassword" type="password" label="Confirm Password" required></v-text-field>
          <div class="mb-3">
            <div ref="turnstileRef"></div>
          </div>
          <v-btn class="mt-2 btn btn-primary display-4" type="submit" block @click="handleResetPassword" :loading="loading" :disabled="loading || !turnstileToken">
            Reset Password
          </v-btn>
        </v-form>
      </div>

      <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal">
        {{ message }}
      </v-alert>

      <div class="mt-4 text-center">
        <NuxtLink :to="localePath('/login')">Back to Login</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#app'
import { definePageMeta } from '#imports'
import { z } from 'zod'
import { reactive, ref } from '#imports'
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import useLocalePath from '../composables/useLocalePath'
import { resetPassword } from "#auth/lib/auth-client";

definePageMeta({
  auth: {
    only: 'guest'
  }
})

const { t } = useLocate()
useHead({
  title: t('resetPassword.title')
})

const alert = useAlert()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const appName = String(runtimeConfig.public?.appName || 'App')

const state = reactive({
  password: '',
  confirmPassword: ''
})

const schema = z.object({
  password: z.string().min(8, t('resetPassword.errors.minLength', { min: 8 })),
  confirmPassword: z.string().min(8, t('resetPassword.errors.minLength', { min: 8 })).refine(val => val === state.password, {
    message: t('resetPassword.errors.passwordMismatch')
  })
})

const loading = ref(false)

// reactive message used by the template's v-alert
const message = ref<string | null>(null)
const messageType = ref<'info' | 'success' | 'error' | 'warning'>('info')
// ref for the Turnstile container and the token set by the widget
const turnstileRef = ref<HTMLElement | null>(null)
const turnstileToken = ref<string | null>(null)

const handleResetPassword = async () => {
  if (state.confirmPassword !== state.password) {
		alert("Please enter same passwords");
		return;
	}

  loading.value = true
  message.value = null

	await resetPassword({
    newPassword: state.password,
		fetchOptions: {
      onSuccess() {
        messageType.value = 'success'
        message.value = 'Your password has been reset. Redirecting to login.'
        navigateTo(localePath('/login'))
			},
			onError(context) {
        messageType.value = 'error'
        message.value = context.error.message;
			},
		},
	});

  loading.value = false
};
</script>

<style scoped>
  .authForm {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
  }

  .message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 4px;
  }
</style>