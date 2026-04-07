import { MFrameworkContext } from './context'
import { MFrameworkEventBus } from '../types/events'

let currentContext: MFrameworkContext | null = null
let currentEventBus: MFrameworkEventBus | null = null

export function setRuntimeContext(ctx: MFrameworkContext, bus: MFrameworkEventBus) {
  currentContext = ctx
  currentEventBus = bus
}

export function useMFrameworkContext(): MFrameworkContext {
  if (!currentContext) {
    throw new Error('[alternate-gateway/core] useMFrameworkContext() called before app initialization')
  }
  return currentContext
}

export function useMFrameworkEventBus(): MFrameworkEventBus {
  if (!currentEventBus) {
    throw new Error('[alternate-gateway/core] useMFrameworkEventBus() called before app initialization')
  }
  return currentEventBus
}

export function useRuntimeConfig() {
  return useMFrameworkContext().config
}