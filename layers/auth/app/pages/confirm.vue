<template>
  <div>Waiting for login...</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { onBeforeUnmount, onMounted, watch } from '#imports'
import { useUserStore } from '../stores/user'

const store = useUserStore()
let loginRedirectTimer: ReturnType<typeof setTimeout> | null = null

watch(() => store.user, (u) => {
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