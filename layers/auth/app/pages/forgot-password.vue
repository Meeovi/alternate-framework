<template>
  <div class="authPage">
    <section data-bs-version="5.1" class="authForm">
      <NuxtImg loading="lazy" src="~/assets/images/logo512alpha-128x128.png" alt="Meeovi Logo" class="authLogo" />
      <h1 class="mbr-section-title mbr-fonts-style display-1">Forgot Password</h1>

      <div class="mbr-section-btn">
        <div class="request-reset-form">
          <p>Enter your email address to receive a password reset link.</p>
          <form class="mbr-section-btn" :schema="schema" :state="state" @submit="onSubmit">
            <v-text-field v-model="state.email" type="email" label="Email" required></v-text-field>
            <div class="mb-3">
              <div ref="turnstileRef"></div>
            </div>
            <v-btn class="mt-2 btn btn-primary display-4" type="submit" block :loading="loading" :disabled="loading || !turnstileToken">
              Send Reset Link
            </v-btn>
          </form>
        </div>

        <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal" closable>
          {{ message }}
        </v-alert>

        <div class="mt-4 text-center">
          <p>Remember your password?
            <NuxtLink to="/login">Sign In</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { definePageMeta, useI18n, useToast, useLocalePath } from '#imports'
import { useAuth, z } from '@meeovi/auth'
import { reactive, ref } from 'vue'

definePageMeta({
  auth: {
    only: 'guest'
  }
})

const { t } = useI18n()
useHead({
  title: t('forgotPassword.title')
})

const auth = useAuth()
const toast = useToast()
const localePath = useLocalePath()

const schema = z.object({
  email: z.email(t('forgotPassword.errors.invalidEmail'))
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined
})

const loading = ref(false)

// expose message and messageType used by the template v-alert
const message = ref<string | null>(null)
const messageType = ref<'info' | 'success' | 'error' | 'warning' | undefined>(undefined)

// Turnstile placeholders referenced in the template
const turnstileRef = ref<HTMLElement | null>(null)
const turnstileToken = ref<string | null>(null)

async function onSubmit(event: Event) {
  event.preventDefault()
  if (loading.value)
    return

  loading.value = true
  // clear previous messages
  message.value = null
  messageType.value = undefined

  const { error } = await auth.forgetPassword({
    email: state.email,
    redirectTo: localePath('/reset-password')
  })

  if (error) {
    const text = error.message || error.statusText || t('forgotPassword.errors.generic')
    // update v-alert bindings
    message.value = text
    messageType.value = 'error'
    toast.show({
      title: text,
      color: 'error'
    })
  }
  else {
    const successText = t('forgotPassword.success')
    // update v-alert bindings
    message.value = successText
    messageType.value = 'success'
    toast.show({
      title: successText,
      color: 'success'
    })
  }
  loading.value = false
}
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