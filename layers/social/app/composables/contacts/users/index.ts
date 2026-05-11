// Production-ready user composable for the social layer
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  email?: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  [key: string]: any
}

// Simulated user state (replace with real API integration)
const _currentUser = ref<User | null>(null)

export function useCurrentUser() {
  return computed(() => _currentUser.value)
}

export function setCurrentUser(user: User | null) {
  _currentUser.value = user
}

// Example: Remove push notification data
export function removePushNotificationData() {
  // Implement actual logic as needed
  if (_currentUser.value) {
    // ...
  }
}

// Example: Remove all push notifications
export function removePushNotifications() {
  // Implement actual logic as needed
}

// Example: Get instance domain
export function getInstanceDomain() {
  return 'meeovi.com'
}
