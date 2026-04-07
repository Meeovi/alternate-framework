<template>
  <div class="authPage">
    <section data-bs-version="5.1" class="authForm">
      <NuxtImg loading="lazy" src="~/assets/images/logo512alpha-128x128.png" :alt="appName" class="authLogo" />
      <h1 class="mbr-section-title mbr-fonts-style display-1">Forgot Password</h1>

      <div class="mbr-section-btn">
        <div class="request-reset-form">
          <p>Enter your email address to receive a password reset link.</p>
          <v-form class="mbr-section-btn" :schema="schema" :state="state">
            <v-text-field v-model="state.email" type="email" label="Email" required></v-text-field>
            <div class="mb-3">
              <div ref="turnstileRef"></div>
            </div>
            <v-btn class="mt-2 btn btn-primary display-4" type="submit" block @click="handleForgetPassword" :loading="loading" :disabled="loading || !turnstileToken">
              Send Reset Link
            </v-btn>
          </v-form>
        </div>

        <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal" closable>
          {{ message }}
        </v-alert>

        <div class="mt-4 text-center">
          <p>Remember your password?
            <NuxtLink :to="localePath('/login')">Sign In</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useRuntimeConfig } from '#imports'
import useLocalePath from '../composables/useLocalePath'
import { z } from 'zod'
import { reactive, ref } from '#imports'
import { forgetPassword } from "#auth/lib/auth-client";

definePageMeta({
  auth: {
    only: 'guest'
  }
})

useHead({
  title: 'Forgot Password'
})

const alert = useAlert()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
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

// Turnstile placeholders referenced in the template
const turnstileRef = ref<HTMLElement | null>(null)
const turnstileToken = ref<string | null>(null)

const handleForgetPassword = async () => {
  if (!state.email) {
		alert("Please enter your email address");
		return;
	}
  loading.value = true
  message.value = null
	await forgetPassword(
		{
      email: state.email,
			redirectTo: "/reset-password",
		},
		{
			// onSuccess find the url with token in server console. For detail check forgetPassword section: https://www.better-auth.com/docs/authentication/email-password
			onSuccess() {
        messageType.value = 'success'
        message.value = 'Password reset link sent to your email.'
			},
			onError(context) {
        messageType.value = 'error'
        message.value = context.error.message;
			},
		},
	);
  loading.value = false
};
</script>

<style scoped>
  .authPage {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--v-background);
  }

  .authForm {
    width: 100%;
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: var(--v-surface-variant);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .authLogo {
    display: block;
    margin: 0 auto 2rem;
    max-width: 128px;
    height: auto;
  }

  .mbr-section-title {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: 600;
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