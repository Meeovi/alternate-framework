<template>
  <transition
    name="slide-down"
    @enter="onEnter"
    @leave="onLeave"
  >
    <v-alert
      v-if="!isOnline && showAlert"
      type="warning"
      theme="dark"
      icon="fas fa-wifi-slash"
      class="offline-alert"
      dismissible
      @click:close="dismissAlert"
    >
      <div class="alert-content">
        <strong>You're offline</strong>
        <p class="alert-message">
          Some features may not work until your connection is restored. Your changes will be queued and synced when you're back online.
        </p>
      </div>
    </v-alert>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNetworkStatus } from '../../composables/globals/useNetworkStatus'

const { isOnline } = useNetworkStatus()
const showAlert = ref(true)

const dismissAlert = () => {
  showAlert.value = false
}

// Show alert again when connection is lost
watch(
  () => isOnline.value,
  (online) => {
    if (!online) {
      showAlert.value = true
    }
  },
)

// Animate alert entrance
const onEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(-100%)'
  setTimeout(() => {
    htmlEl.style.transition = 'all 0.3s ease'
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateY(0)'
  }, 10)
}

const onLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = 'all 0.3s ease'
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(-100%)'
}
</script>

<style scoped>
.offline-alert {
  position: fixed;
  top: 56px; /* Below header */
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: 0;
  margin: 0;
  width: 100%;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Slide down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
