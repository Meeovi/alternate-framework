<template>
  <div>Processing login...</div>
</template>

<script setup>
import useLocalePath from '../composables/useLocalePath'
import { useUserStore } from '#auth/app/stores/user'

const router = useRouter()
const store = useUserStore()

onMounted(async () => {
  const localePath = useLocalePath()
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
