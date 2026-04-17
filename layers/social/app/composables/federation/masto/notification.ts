import { createNotificationTools } from '@mframework/adapter-federation'

const notificationTools = createNotificationTools({
  currentUser,
  isHydrated,
  useMasto,
  onHydrated,
  untilTruthy: getter => until(computed(() => getter())).toBeTruthy(),
})

export const useNotifications = notificationTools.useNotifications
