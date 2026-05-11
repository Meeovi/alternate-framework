<template>
  <div class="auth-message-wrap">
    <v-card class="auth-message-card" elevation="0">
      <v-card-title class="text-h5">Processing Login</v-card-title>
      <v-card-text>Please wait while we complete authentication.</v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import useAppLocalePath from '../utils/useAppLocalePath'
import { useUserStore } from '../stores/user'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const store = useUserStore()

onMounted(async () => {
  const localePath = useAppLocalePath()
  try {
    // No server session to refresh; rely on local store state
    if (store.user) {
      await router.push(localePath('/'))
    } else {
      await router.push(localePath('/login'))
    }
  } catch (error) {
    console.error('Callback navigation failed:', error)
    await router.push(localePath('/login'))
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
