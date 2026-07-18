<!-- pages/settings/sessions.vue -->
<template>
  <v-container class="max-width-600 my-8">
    <v-card elevation="2" rounded="lg">
      <v-toolbar color="indigo" class="text-white" flat>
        <v-icon start class="ml-4">mdi-account-multiple</v-icon>
        <v-toolbar-title>Active Sessions (Account Switching)</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-6">
        <p class="text-body-1 mb-6 text-medium-emphasis">
          Switch seamlessly between logged-in accounts or sign out from individual devices/sessions.
        </p>

        <!-- Alerts -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4" closable @click:close="errorMsg = null">
          {{ errorMsg }}
        </v-alert>
        <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4" closable @click:close="successMsg = null">
          {{ successMsg }}
        </v-alert>

        <!-- Session List -->
        <v-list v-if="sessions.length > 0" border class="rounded-lg">
          <v-list-item
            v-for="session in sessions"
            :key="session.id"
            :subtitle="session.user?.email || 'Active Session'"
            class="py-3"
          >
            <!-- User Profile Avatar/Initials -->
            <template #prepend>
              <v-avatar color="indigo-lighten-4" class="mr-3">
                <v-img v-if="session.user?.image" :src="session.user.image" />
                <v-icon v-else color="indigo">mdi-account</v-icon>
              </v-avatar>
            </template>

            <!-- Device Metadata Details -->
            <template #title>
              <span class="font-weight-bold">
                {{ session.user?.name || 'Unnamed User' }}
              </span>
              <v-chip
                v-if="session.sessionToken === currentToken"
                size="x-small"
                color="success"
                class="ml-2 font-weight-bold"
              >
                Current
              </v-chip>
            </template>

            <v-list-item-subtitle class="mt-1 text-caption d-block">
              <span class="d-block">IP: {{ session.ipAddress || 'Unknown' }}</span>
              <span class="d-block text-truncate">Client: {{ session.userAgent || 'Unknown Browser' }}</span>
            </v-list-item-subtitle>

            <!-- Actions -->
            <template #append>
              <div class="d-flex align-center">
                <v-btn
                  v-if="session.sessionToken !== currentToken"
                  variant="outlined"
                  color="indigo"
                  size="small"
                  class="mr-2"
                  :disabled="isProcessing"
                  @click="switchSession(session.sessionToken)"
                >
                  Switch
                </v-btn>
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="small"
                  :disabled="isProcessing"
                  @click="revokeSession(session.sessionToken)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>

        <!-- Empty State -->
        <div v-else-if="!isProcessing" class="text-center py-8">
          <v-icon size="48" class="text-disabled mb-2">mdi-account-off-outline</v-icon>
          <div class="text-body-1 text-medium-emphasis">No active browser sessions found.</div>
        </div>

        <!-- Skeleton Loading -->
        <v-skeleton-loader v-else type="list-item-avatar-three-line" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useMultiSession } from '../../../composables/plugins/useMultiSession'
import { useCookie } from '#app'

const {
  isProcessing,
  sessions,
  errorMsg,
  successMsg,
  fetchSessions,
  switchSession,
  revokeSession
} = useMultiSession()

// Read current active session token from cookie to mark the "active" chip
// (Matches Better Auth default session token cookie name)
const currentToken = computed(() => {
  const sessionCookie = useCookie('better-auth.session_token')
  return sessionCookie.value || ''
})

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.max-width-600 {
  max-width: 600px;
}
</style>