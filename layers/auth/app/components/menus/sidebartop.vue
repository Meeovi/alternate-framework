<template>
  <div>
    <div v-if="loggedInState">
      <v-toolbar :title="`Welcome, ${user?.name || user?.email}`" color="info"></v-toolbar>
    </div>

    <div v-else style="padding-top: 10px;">
      <v-btn variant="text" title="Sign In to Meeovi" text="Sign In" href="/login" style="width: 100%;"></v-btn>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  const auth = useAuth()
  await auth.fetchSession()

  const user = computed(() => auth.user.value ?? null)
  const loggedInState = computed(() => Boolean(auth.loggedIn.value))
</script>
