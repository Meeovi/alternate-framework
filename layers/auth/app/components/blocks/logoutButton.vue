<template>
  <v-btn variant="flat" @click="signOut">Logout</v-btn>
</template>

<script setup>
const { logout } = useAuth()
const router = useRouter()

const signOut = async () => {
  await logout()
  await router.push('/login')
}
</script>

