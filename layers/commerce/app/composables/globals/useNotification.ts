import { ref } from 'vue'

export type NotificationPayload = { type: 'success'|'error'|'info'|'warning'; message: string }

const notifications = ref<NotificationPayload[]>([])

export function useNotification() {
  function show(payload: NotificationPayload) {
    notifications.value.push(payload)
    // For production-grade UX integrate with a toast library here.
    // Using console as fallback to keep runtime deterministic.
    if (payload.type === 'error') console.error(payload.message)
    else console.log(payload.type.toUpperCase(), payload.message)
  }

  function clear() { notifications.value = [] }

  return { notifications, show, clear }
}

export default useNotification
