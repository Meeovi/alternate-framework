import { ref, computed } from 'vue'

interface Alert {
  message: string | null
  type: 'success' | 'error' | 'warning' | 'info'
  visible: boolean
  timeout?: ReturnType<typeof setTimeout>
}

const alertState = ref<Alert>({
  message: null,
  type: 'info',
  visible: false
})

export function useAlert() {
  const message = computed(() => alertState.value.message)
  const type = computed(() => alertState.value.type)
  const visible = computed(() => alertState.value.visible)

  const clearAlertTimeout = () => {
    if (alertState.value.timeout) {
      globalThis.clearTimeout(alertState.value.timeout)
      alertState.value.timeout = undefined
    }
  }

  const show = (msg: string, alertType: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
    clearAlertTimeout()
    alertState.value.message = msg
    alertState.value.type = alertType
    alertState.value.visible = true

    if (duration > 0) {
      alertState.value.timeout = setTimeout(() => {
        alertState.value.visible = false
      }, duration)
    }
  }

  const success = (msg: string, duration = 5000) => {
    show(msg, 'success', duration)
  }

  const error = (msg: string, duration = 5000) => {
    show(msg, 'error', duration)
  }

  const warning = (msg: string, duration = 5000) => {
    show(msg, 'warning', duration)
  }

  const info = (msg: string, duration = 5000) => {
    show(msg, 'info', duration)
  }

  const close = () => {
    clearAlertTimeout()
    alertState.value.visible = false
    alertState.value.message = null
  }

  return {
    message,
    type,
    visible,
    show,
    success,
    error,
    warning,
    info,
    close
  }
}
