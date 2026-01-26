<template>
  <div>Processing login...</div>
</template>

<script setup>
const router = useRouter()
const store = useUserStore()

onMounted(async () => {
  try {
    // No server session to refresh; rely on local store state
    if (store.user) {
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
