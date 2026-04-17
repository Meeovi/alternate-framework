<template>
  <v-btn variant="flat" @click="signOutNow">Logout</v-btn>
</template>

<script setup>
import { useAuth } from 'alternate-auth/runtime/composables/useAuth'
import useLocalePath from '#auth/app/composables/useLocalePath'

const auth = useAuth()
const localePath = useLocalePath()

const signOutNow = async () => {
  await auth.signOut({ redirectTo: localePath('/login') })
}
</script>
