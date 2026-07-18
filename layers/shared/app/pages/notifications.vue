<template>
  <div class="notifications-page">
    <v-toolbar>
      <v-toolbar-title>Notifications Center</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="unreadCount > 0"
        variant="text"
        color="primary"
        @click="markAllAsRead"
      >
        Mark all as read
      </v-btn>
    </v-toolbar>

    <div style="padding: 20px;">
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-4 text-grey">Loading notifications...</p>
      </div>

      <v-alert
        v-else-if="error"
        type="error"
        class="mb-4"
      >
        {{ error }}
      </v-alert>

      <v-list
        v-else-if="notifications.length > 0"
        lines="two"
        class="notification-list"
      >
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <template v-slot:prepend>
            <v-icon
              :icon="getNotificationIcon(notification.category)"
              :color="getNotificationColor(notification.category)"
            ></v-icon>
          </template>

          <v-list-item-title v-dompurify-html="notification.title"></v-list-item-title>
          <v-list-item-subtitle>
            {{ notification.body }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption">
            {{ new Date(notification.createdAt).toLocaleString() }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn
              icon="fas fa-trash"
              variant="text"
              size="small"
              color="error"
              @click.stop="dismiss(notification.id)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-alert
        v-else
        type="info"
        class="mt-4"
      >
        You have no notifications.
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserNotifications } from '#shared/app/composables/notifications/useUserNotifications'

const {
  notifications,
  unreadCount,
  loading,
  error,
  markAsRead,
  markAllAsRead,
  dismiss,
} = useUserNotifications()

const getNotificationIcon = (category: string) => {
  const icons: Record<string, string> = {
    order: 'fas fa-shopping-cart',
    account: 'fas fa-user',
    social: 'fas fa-users',
    system: 'fas fa-bell',
    email: 'fas fa-envelope',
  }
  return icons[category] || 'fas fa-bell'
}

const getNotificationColor = (category: string) => {
  const colors: Record<string, string> = {
    order: 'primary',
    account: 'info',
    social: 'success',
    system: 'warning',
    email: 'secondary',
  }
  return colors[category] || 'grey'
}
</script>

<style scoped>
.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}
</style>