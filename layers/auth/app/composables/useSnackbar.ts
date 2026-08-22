import { useState } from "nuxt/app"

type ToastOptions = {
  title?: string
  description?: string
  color?: string
  timeout?: number
}

type SnackbarMessage = {
  id: number
  message: string
  color?: string
  timeout?: number
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
        const idx = active.value.findIndex((s: SnackbarMessage) => s.id === next.id)
        if (idx >= 0) active.value.splice(idx, 1)
      }, next.timeout ?? 3000)
    }
  }

  function show(options: { message: string; color?: string; timeout?: number }) {
    queue.value.push({
      id: Date.now() + Math.random(),
      message: options.message,
      color: options.color || 'info',
      timeout: options.timeout || 3000,
    })

    processQueue()
  }

  function remove(id: number) {
    active.value = active.value.filter((s: SnackbarMessage) => s.id !== id)
    processQueue()
  }

  return {
    queue,
    active,
    show,
    remove,
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
