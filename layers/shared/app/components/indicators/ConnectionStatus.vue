<template>
  <div v-if="showIndicator" class="connection-status" :class="`status-${networkStatus}`">
    <div class="connection-indicator" :class="networkStatus" :title="statusLabel" />
    <span v-if="showLabel" class="status-label">{{ statusLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNetworkStatus } from '../../composables/globals/useNetworkStatus'

const props = withDefaults(
  defineProps<{
    showLabel?: boolean
    compact?: boolean
  }>(),
  {
    showLabel: false,
    compact: true,
  },
)

const { networkStatus, isOnline } = useNetworkStatus()

const statusLabel = computed(() => {
  switch (networkStatus.value) {
    case 'offline':
      return 'Offline'
    case 'slow':
      return 'Slow connection'
    case 'online':
    default:
      return 'Online'
  }
})

const showIndicator = computed(() => {
  // Show indicator only when offline or on slow connection
  // Don't clutter UI when everything is working fine
  return networkStatus.value !== 'online'
})
</script>

<style scoped>
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  height: 32px;
  min-height: 32px;
  border-radius: 4px;
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 500;
}

.connection-status.status-offline {
  background-color: rgba(244, 67, 54, 0.1);
  color: rgb(244, 67, 54);
}

.connection-status.status-slow {
  background-color: rgba(255, 152, 0, 0.1);
  color: rgb(255, 152, 0);
}

.connection-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 8px;
}

.connection-indicator.online {
  background-color: #4caf50;
}

.connection-indicator.offline {
  background-color: #f44336;
}

.connection-indicator.slow {
  background-color: #ff9800;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-label {
  white-space: nowrap;
}

/* Compact mode - icon only */
@media (max-width: 600px) {
  .status-label {
    display: none;
  }

  .connection-status {
    padding: 0.25rem 0.5rem;
  }
}
</style>
