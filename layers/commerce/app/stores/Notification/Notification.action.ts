import { Notification, NotificationOptions, NotificationType } from './Notification.type'

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function showNotification(message: string, type: NotificationType = NotificationType.INFO, options: NotificationOptions = {}): Notification {
  const notification: Notification = {
    id: genId(),
    message,
    type: options.type || type,
    meta: options.meta,
    createdAt: Date.now(),
  }

  if (typeof window !== 'undefined' && 'CustomEvent' in window) {
    window.dispatchEvent(new CustomEvent('mframework:notification', { detail: notification }))
  }

  return notification
}

export function notifyInfo(message: string, options: NotificationOptions = {}) {
  return showNotification(message, NotificationType.INFO, options)
}

export function notifySuccess(message: string, options: NotificationOptions = {}) {
  return showNotification(message, NotificationType.SUCCESS, options)
}

export function notifyError(message: string, options: NotificationOptions = {}) {
  return showNotification(message, NotificationType.ERROR, options)
}

export default {
  showNotification,
  notifyInfo,
  notifySuccess,
  notifyError,
}
