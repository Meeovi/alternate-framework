import { useNuxtApp } from 'nuxt/app'

type AlertLevel = 'info' | 'success' | 'warning' | 'error'

type AlertCallable = ((message: string) => void) & {
  info: (message: string) => void
  success: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
}

function dispatch(level: AlertLevel, message: string): void {
  const app = useNuxtApp() as any

  // If a toast plugin is present, prefer it.
  if (typeof app?.$toast === 'function') {
    app.$toast(message, { type: level })
    return
  }

  if (app?.$toast && typeof app.$toast[level] === 'function') {
    app.$toast[level](message)
    return
  }

  if (app?.$snackbar && typeof app.$snackbar === 'function') {
    app.$snackbar({ text: message, color: level })
    return
  }

  const method = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
  console[method](`[alert:${level}] ${message}`)
}

export function useAlert(): AlertCallable {
  const call = ((message: string) => dispatch('info', message)) as AlertCallable

  call.info = (message: string) => dispatch('info', message)
  call.success = (message: string) => dispatch('success', message)
  call.warning = (message: string) => dispatch('warning', message)
  call.error = (message: string) => dispatch('error', message)

  return call
}

export default useAlert
