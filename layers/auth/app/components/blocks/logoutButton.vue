<template>
  <v-btn v-if="loggedIn" variant="flat" @click="signOut({ redirectTo: '/' })">Logout</v-btn>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  enabled?: boolean
  redirectTo?: string
}>(), {
  enabled: true,
  redirectTo: '/',
})

const { signOut, loggedIn } = useAuth()
</script>
