<template>
  <div class="notifications-menu">
    <v-btn class="notification-trigger" icon="fas fa-bell" variant="text" @click.stop="drawer = !drawer" aria-label="Notifications">
      <v-badge v-if="unreadCount > 0" :content="unreadCount" color="error" floating>
        <v-icon icon="fas fa-bell" />
      </v-badge>
      <v-icon v-else icon="fas fa-bell" />
    </v-btn>

    <v-navigation-drawer v-model="drawer" location="right" temporary class="notifications-flyout">
      <div class="flyout-header">
        <div>
          <h3 class="flyout-title">Inbox</h3>
          <p class="flyout-subtitle">Live updates: {{ connected ? 'Connected' : 'Reconnecting' }}</p>
        </div>
        <v-btn icon="fas fa-x" variant="text" @click="drawer = false" aria-label="Close notifications" />
      </div>

      <v-divider />

      <v-list class="notification-list">
        <v-list-item v-for="notification in previewNotifications" :key="notification.id" :class="{ unread: !notification.read }"
          :to="notification.actionUrl || '/notifications'" @click="handleOpen(notification.id)">
          <template #prepend>
            <v-icon :icon="getNotificationIcon(notification.category)" :color="getNotificationColor(notification.category)" />
          </template>
          <v-list-item-title class="notification-title">{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle class="notification-meta">
            {{ notification.body }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="notification-meta">
            {{ formatDate(notification.createdAt) }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="!previewNotifications.length" class="py-6">
          <v-list-item-title>No notifications yet</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <div class="flyout-actions">
        <v-btn variant="text" color="primary" @click="markAllAsRead" :disabled="!unreadCount">
          Mark all as read
        </v-btn>
        <v-btn color="primary" variant="tonal" to="/notifications" @click="drawer = false">
          All notifications
        </v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotifications } from '../../composables/globals/useNotifications'

const drawer = ref(false)
const {
  notifications,
  unreadCount,
  connected,
  markAsRead,
  markAllAsRead,
} = useNotifications()

const previewNotifications = computed(() => notifications.value.slice(0, 6))

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

function handleOpen(id: string): void {
  markAsRead(id).catch(() => {})
}
</script>

<style scoped>
.notifications-menu {
  display: flex;
  align-items: center;
}

.notification-trigger {
  position: relative;
}

.notifications-flyout {
  width: min(92vw, 380px) !important;
}

.flyout-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flyout-title {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

.flyout-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  opacity: 0.75;
}

.notification-list {
  max-height: 65vh;
  overflow: auto;
}

.notification-title {
  white-space: normal;
  line-height: 1.3;
}

.notification-meta {
  white-space: normal;
  line-height: 1.25;
}

.unread {
  background: rgba(var(--v-theme-primary), 0.08);
}

.flyout-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1rem;
}

@media (max-width: 700px) {
  .flyout-actions {
    flex-direction: column;
  }
}
</style>