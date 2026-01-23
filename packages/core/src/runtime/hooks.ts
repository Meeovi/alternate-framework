import { AlternateContext } from './context'
import { AlternateEventBus } from '../types/events'

let currentContext: AlternateContext | null = null
let currentEventBus: AlternateEventBus | null = null

export function setRuntimeContext(ctx: AlternateContext, bus: AlternateEventBus) {
  currentContext = ctx
  currentEventBus = bus
}

export function useAlternateContext(): AlternateContext {
  if (!currentContext) {
    throw new Error('[@meeovi/core] useAlternateContext() called before app initialization')
  }
  return currentContext
}

export function useAlternateEventBus(): AlternateEventBus {
  if (!currentEventBus) {
    throw new Error('[@meeovi/core] useAlternateEventBus() called before app initialization')
  }
  return currentEventBus
}