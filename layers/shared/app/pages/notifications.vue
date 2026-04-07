<template>
  <section class="notifications-page">
    <header class="notifications-page__header">
      <div>
        <h1>Notifications</h1>
        <p>Your unified inbox across all connected backends.</p>
      </div>
      <v-btn color="primary" variant="tonal" :disabled="!unreadCount" @click="markAllAsRead">
        Mark all as read
      </v-btn>
    </header>

    <v-alert v-if="!connected" type="info" variant="tonal" class="mb-4">
      Reconnecting to live notification stream...
    </v-alert>

    <v-list class="notifications-page__list" lines="three">
      <v-list-item
        v-for="notification in notifications"
        :key="notification.id"
        :class="{ unread: !notification.read }"
        :to="notification.actionUrl || '/notifications'"
        @click="markAsRead(notification.id).catch(() => {})"
      >
        <template #prepend>
          <v-icon :icon="getNotificationIcon(notification.category)" :color="getNotificationColor(notification.category)" />
        </template>

        <v-list-item-title>{{ notification.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ notification.body }}</v-list-item-subtitle>
        <v-list-item-subtitle>{{ formatDate(notification.createdAt) }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item v-if="!notifications.length && !loading">
        <v-list-item-title>No notifications yet.</v-list-item-title>
      </v-list-item>
    </v-list>
  </section>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/globals/useNotifications'

const {
  notifications,
  unreadCount,
  connected,
  loading,
  markAsRead,
  markAllAsRead,
} = useNotifications()

function getNotificationIcon(category: string): string {
  const icons: Record<string, string> = {
    info: 'fas fa-circle-info',
    assignment: 'fas fa-list-check',
    alert: 'fas fa-triangle-exclamation',
  }
  return icons[category] || 'fas fa-bell'
}

function getNotificationColor(category: string): string {
  const colors: Record<string, string> = {
    info: 'info',
    assignment: 'primary',
    alert: 'error',
  }
  return colors[category] || 'grey'
}

function formatDate(value: Date): string {
  return new Date(value).toLocaleString()
}
</script>

<style scoped>
.notifications-page {
  margin: 0 auto;
  max-width: 980px;
  padding: 1.5rem 1rem;
}

.notifications-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.notifications-page__header h1 {
  margin: 0;
  line-height: 1.2;
}

.notifications-page__header p {
  margin: 0.25rem 0 0;
  opacity: 0.8;
}

.notifications-page__list {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.8);
}

.unread {
  background: rgba(var(--v-theme-primary), 0.08);
}

@media (max-width: 700px) {
  .notifications-page__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
