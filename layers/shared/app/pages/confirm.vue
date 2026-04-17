<template>
  <div>Waiting for login...</div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'

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