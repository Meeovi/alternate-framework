<template>
  <div class="authPage">
    <section data-bs-version="5.1" class="authForm">
      <NuxtImg loading="lazy" src="~/assets/images/logo512alpha-128x128.png" alt="Meeovi Logo" class="authLogo" />
      <h1 class="mbr-section-title mbr-fonts-style display-1">Reset Password</h1>

      <div class="reset-password-form">
        <v-form class="mbr-section-btn" :schema="schema" :state="state" @submit="onSubmit">
          <v-text-field v-model="state.password" type="password" label="New Password" required></v-text-field>
          <v-text-field v-model="state.confirmPassword" type="password" label="Confirm Password" required></v-text-field>
          <div class="mb-3">
            <div ref="turnstileRef"></div>
          </div>
          <v-btn class="mt-2 btn btn-primary display-4" type="submit" block :loading="loading" :disabled="loading || !turnstileToken">
            Reset Password
          </v-btn>
        </v-form>
      </div>

      <v-alert v-if="message" :type="messageType" class="mt-4" variant="tonal">
        {{ message }}
      </v-alert>

      <div class="mt-4 text-center">
        <NuxtLink to="/login">Back to Login</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useHead, useRoute, useRuntimeConfig, navigateTo } from '#app'
import { definePageMeta } from '#imports'
import { z } from 'zod'
import { reactive, ref } from '#imports'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from 'alternate-locate'

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
const toast = useToast()
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

async function onSubmit(event) {
  event.preventDefault()
  if (loading.value)
    return

  // reset any previous message
  message.value = null
  messageType.value = 'info'

  loading.value = true
  const { error } = await auth.resetPassword({
    newPassword: state.password,
    token: route.query.token
  })

  if (error) {
    toast.show({
      title: error.message,
      color: 'error'
    })
    message.value = error.message
    messageType.value = 'error'
  } else {
    const successMsg = t('resetPassword.success')
    toast.show({
      title: successMsg,
      color: 'success'
    })
    message.value = successMsg
    messageType.value = 'success'
    navigateTo(localePath((runtimeConfig.public).auth.redirectGuestTo))
  }
  loading.value = false
}
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