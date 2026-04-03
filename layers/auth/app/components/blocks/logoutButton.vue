<template>
  <v-btn variant="flat" @click="signOut">Logout</v-btn>
</template>

<script setup>
import { useAuth } from '../../composables/useAuth'
import useLocalePath from '../../composables/useLocalePath'

const { logout } = useAuth()
const localePath = useLocalePath()

const signOut = async () => {
  await logout(localePath('/login'))
}
</script>

