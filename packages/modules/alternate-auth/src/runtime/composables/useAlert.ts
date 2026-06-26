import { useNuxtApp } from 'nuxt/app'

type AlertLevel = 'info' | 'success' | 'warning' | 'error'

type ToastOptions = {
  title?: string
  description?: string
  color?: string
  timeout?: number
}

type AlertCallable = ((message: string) => void) & {
  info: (message: string) => void
  success: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
}

type SnackbarMessage = {
  id: number
  message: string
  color?: string
  timeout?: number
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

export const useSnackbar = () => {
  const queue = useState<SnackbarMessage[]>('snackbar-queue', () => [])
  const active = useState<SnackbarMessage[]>('snackbar-active', () => [])

  const MAX_ACTIVE = 3

  function processQueue() {
    if (active.value.length >= MAX_ACTIVE) return
    if (queue.value.length === 0) return

    const next = queue.value.shift()
    if (next) {
      active.value.push(next)

      setTimeout(() => {
        const idx = active.value.findIndex(s => s.id === next.id)
        if (idx >= 0) active.value.splice(idx, 1)
      }, next.timeout ?? 3000)
    }
  }

  function show(options: { message: string; color?: string; timeout?: number }) {
    queue.value.push({
      id: Date.now() + Math.random(),
      message: options.message,
      color: options.color || 'info',
      timeout: options.timeout || 3000
    })

    processQueue()
  }

  function remove(id: number) {
    active.value = active.value.filter(s => s.id !== id)
    processQueue()
  }

  return {
    queue,
    active,
    show,
    remove
  }
}

export function useToast() {
  const snackbar = useSnackbar()
  return {
    add: (opts: ToastOptions) => {
      snackbar.show({
        message: opts.title ? `${opts.title}: ${opts.description || ''}` : opts.description || '',
        color: opts.color,
        timeout: opts.timeout,
      })
    },
  }
}

export default useAlert