<template>
  <div>
    <div v-if="loggedIn">
      <v-toolbar :title="`Welcome, ${user?.name || user?.email}`" color="info"></v-toolbar>
    </div>

    <div v-else style="padding-top: 10px;">
      <v-btn variant="text" title="Sign In to Meeovi" text="Sign In" href="/login" style="width: 100%;"></v-btn>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  
  const { user, loggedIn, fetch: fetchUserSession } = useUserSession()
  
  // Initialize user on component mount
  onMounted(async () => {
    const currentUser = await fetchUserSession()
    if (currentUser) {
      user.value = currentUser
    }
  })
</script>