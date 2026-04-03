<template>
  <div class="authPage">
    <section data-bs-version="5.1" class="authForm">
      <NuxtImg loading="lazy" src="~/assets/images/logo512alpha-128x128.png" :alt="`${process.env.NUXT_APP_NAME}`" class="authLogo" />
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

<script setup>
import { useHead, useRoute, useRuntimeConfig, navigateTo } from '#app'
import { definePageMeta } from '#imports'
import { z } from 'zod'
import { reactive, ref } from '#imports'
import { useAuth } from '../composables/useAuth'
import { useI18n } from 'vue-i18n'
import useLocalePath from '../composables/useLocalePath'
import { resetPassword } from "#auth/lib/auth-client";

definePageMeta({
  auth: {
    only: 'guest'
  }
})

const { t } = useI18n()
useHead({
  title: t('resetPassword.title')
})

const auth = useAuth()
const alert = useAlert()
const route = useRoute()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()

const state = reactive({
  password: undefined,
  confirmPassword: undefined
})

const schema = z.object({
  password: z.string().min(8, ('resetPassword.errors.minLength', { min: 8 })),
  confirmPassword: z.string().min(8, ('resetPassword.errors.minLength', { min: 8 })).refine(val => val === state.password, {
    message: ('resetPassword.errors.passwordMismatch')
  })
})

const loading = ref(false)

// reactive message used by the template's v-alert
const message = ref(null)
const messageType = ref('info')
// ref for the Turnstile container and the token set by the widget
const turnstileRef = ref(null)
const turnstileToken = ref(null)

const confirmPassword = ref("");
const password = ref("");

const handleResetPassword = async () => {
	if (confirmPassword.value !== password.value) {
		alert("Please enter same passwords");
		return;
	}

	await resetPassword({
		newPassword: password.value,
		fetchOptions: {
			onSuccess(context) {
				window.location.href = "/login";
			},
			onError(context) {
				alert(context.error.message);
			},
		},
	});
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