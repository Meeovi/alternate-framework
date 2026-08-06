<template>
  <v-btn v-if="isLoggedIn" variant="flat" @click="handleSignOut">Logout</v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFetch } from 'nuxt/app'
import { authClient } from '../../../lib/auth-client'

const props = withDefaults(defineProps<{
  enabled?: boolean
  redirectTo?: string
}>(), {
  enabled: true,
  redirectTo: '/',
})

const isLoggedIn = ref(false)

async function checkSession() {
  const { data } = await useAuth().useSession(useFetch)
  isLoggedIn.value = !!((data as any).value)
}

async function handleSignOut() {
  await authClient.signOut()
  navigateTo(props.redirectTo)
}

onMounted(checkSession)
</script>
