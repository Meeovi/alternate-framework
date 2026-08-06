<template>
  <div class="auth-message-wrap">
    <v-card class="auth-message-card" elevation="0">
      <v-card-title class="text-h5">Processing Login</v-card-title>
      <v-card-text>Please wait while we complete authentication.</v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useAuth } from '../composables/useAuth'

definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const auth = useAuth()

onMounted(async () => {
  const store = useUserStore()
  try {
    // Fetch the actual server session to determine redirect destination
    const { data: session } = await auth.getSession()
    if (session?.user) {
      await router.push('/')
    } else {
      await router.push('/login')
    }
  } catch (error) {
    console.error('Callback navigation failed:', error)
    await router.push('/login')
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
