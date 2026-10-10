<script setup lang="ts">
// Session via a relative, request-aware fetch (forwards the cookie on SSR) —
// the same approach as layers/auth's route middleware.
const { data: session } = await useAsyncData('workspace:session', () =>
  useRequestFetch()<{ user?: { id?: string, name?: string, username?: string, email?: string, image?: string } } | null>('/api/auth/get-session').catch(() => null)
)
const user = computed(() => session.value?.user)

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'
})

async function logout() {
  await useAuth().signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="pa-4">
    <template v-if="user">
      <h4 class="mb-n1">
        {{ greeting }}, <span class="font-weight-regular">{{ user.name || user.username }}</span>
      </h4>
      <span class="text-subtitle-2 text-medium-emphasis">{{ user.email }}</span>
    </template>
    <h4 v-else>Not signed in</h4>

    <v-divider class="mt-3" />

    <v-list class="mt-3 workspace-profile">
      <template v-if="user">
        <v-list-item color="secondary" rounded="md" to="/settings">
          <template #prepend>
            <v-icon icon="fas fa-gear" size="18" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Account Settings</v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md" to="/u">
          <template #prepend>
            <v-icon icon="fas fa-user" size="18" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Social Profile</v-list-item-title>
        </v-list-item>

        <v-list-item color="secondary" rounded="md" @click="logout">
          <template #prepend>
            <v-icon icon="fas fa-right-from-bracket" size="18" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Logout</v-list-item-title>
        </v-list-item>
      </template>
      <v-list-item v-else color="secondary" rounded="md" to="/login">
        <template #prepend>
          <v-icon icon="fas fa-right-to-bracket" size="18" class="mr-2" />
        </template>
        <v-list-item-title class="text-subtitle-2">Login</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>
