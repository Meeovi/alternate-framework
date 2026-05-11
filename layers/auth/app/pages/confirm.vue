<template>
  <div class="auth-message-wrap">
    <v-card class="auth-message-card" elevation="0">
      <v-card-title class="text-h5">Confirming Session</v-card-title>
      <v-card-text>Please wait while we verify your sign-in.</v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'

definePageMeta({
  layout: 'auth',
})

const store = useUserStore()
let loginRedirectTimer: ReturnType<typeof setTimeout> | null = null

watch(() => store.user, (u: any) => {
  if (u) return navigateTo('/')
}, { immediate: true })

onMounted(() => {
  loginRedirectTimer = setTimeout(() => {
    if (!store.user) {
      void navigateTo('/login')
    }
  }, 3000)
})

onBeforeUnmount(() => {
  if (loginRedirectTimer) {
    clearTimeout(loginRedirectTimer)
    loginRedirectTimer = null
  }
})
</script>

<style scoped>
.auth-message-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-message-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  background: white !important;
}
</style>