// Minimal event bus for aria announcer
import { ref } from 'vue'
type EventHandler<T> = (payload: T) => void
function useEventBus<T = any, P = any>(key: symbol) {
  const listeners = ref<EventHandler<P>[]>([])
  return {
    emit: (event: T, payload?: P) => {
      listeners.value.forEach(fn => fn(payload as P))
    },
    on: (fn: EventHandler<P>) => {
      listeners.value.push(fn)
    },
    off: (fn: EventHandler<P>) => {
      listeners.value = listeners.value.filter(f => f !== fn)
    },
  }
}
export type AriaLive = 'off' | 'polite' | 'assertive'
export type AriaAnnounceType = 'announce' | 'mute' | 'unmute'

const ariaAnnouncer = useEventBus<AriaAnnounceType, string | undefined>(Symbol('aria-announcer'))

export function useAriaAnnouncer() {
  const announce = (message: string) => {
    ariaAnnouncer.emit('announce', message)
  }

  const mute = () => {
    ariaAnnouncer.emit('mute')
  }

  const unmute = () => {
    ariaAnnouncer.emit('unmute')
  }

  return { announce, ariaAnnouncer, mute, unmute }
}

export function useAriaLog() {
  const logs = ref<any[]>([])

  const announceLogs = (messages: any[]) => {
    logs.value = messages
  }

  const appendLogs = (messages: any[]) => {
    logs.value = logs.value.concat(messages)
  }

  const clearLogs = () => {
    logs.value = []
  }

  return {
    announceLogs,
    appendLogs,
    clearLogs,
    logs,
  }
}

export function useAriaStatus() {
  const status = ref<any>('')

  const announceStatus = (message: any) => {
    status.value = message
  }

  const clearStatus = () => {
    status.value = ''
  }

  return {
    announceStatus,
    clearStatus,
    status,
  }
}
