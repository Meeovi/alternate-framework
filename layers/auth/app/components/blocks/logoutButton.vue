<template>
  <UButton variant="flat" @click="signOut">Logout</UButton>
</template>

<script setup>
const { logout } = useAuth()
const router = useRouter()

const signOut = async () => {
  await logout()
  await router.push('/login')
}
</script>

