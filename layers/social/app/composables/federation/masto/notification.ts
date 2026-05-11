import { createNotificationTools } from '@mframework/adapter-federation'
import { watch } from 'vue'
import { currentUser } from '../../contacts/users'
import { isHydrated, onHydrated } from '../../core/vue'
import { useMasto, useMastoClient } from './masto'

const notificationTools = createNotificationTools({
  currentUser,
  isHydrated,
  useMasto: () => ({
    client: { value: useMastoClient() },
    streamingClient: useMasto().streamingClient,
  }),
  onHydrated,
  untilTruthy: async (getter: () => unknown) => {
    if (getter())
      return

    await new Promise<void>((resolve) => {
      const stop = watch(() => getter(), (value) => {
        if (!value)
          return
        stop()
        resolve()
      }, { immediate: true })
    })
  },
} as any)

export const useNotifications = notificationTools.useNotifications
