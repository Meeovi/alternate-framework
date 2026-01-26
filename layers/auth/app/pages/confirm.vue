<template>
  <div>Waiting for login...</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { watch } from 'vue'
import { useUserStore } from '../stores/user'

const store = useUserStore()

watch(() => store.user, (u) => {
  if (u) return navigateTo('/')
}, { immediate: true })

setTimeout(() => {
  if (!store.user) navigateTo('/login')
}, 3000)
</script>