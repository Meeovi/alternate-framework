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
  import { useSession } from 'alternate-auth/client/auth-client'

  const { data: session } = await useSession(useFetch)
  const user = computed(() => session.value?.user ?? null)
  const loggedInState = computed(() => Boolean(session.value?.session))
</script>
