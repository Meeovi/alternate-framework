import { getCommerceClient } from '../../utils/client'
import type { SfProduct, SfOrder } from '~/composables/system/models'

export interface ProductViewEvent {
  name: string
  product: SfProduct
  context?: Record<string, any>
  at: string
}

export interface OrderPlacedEvent {
  name: string
  order: SfOrder
  context?: Record<string, any>
  at: string
}

export type CommerceEvent = ProductViewEvent | OrderPlacedEvent | {
  name: string
  payload?: Record<string, unknown>
  at: string
}

export function useStastics() {
  const client = clientOrNull()
  const events: CommerceEvent[] = []

  async function trackProductView(product: SfProduct, context: Record<string, any> = {}) {
    return trackEvent('product_view', { product, context })
  }

  async function trackOrderPlaced(order: SfOrder, context: Record<string, any> = {}) {
    return trackEvent('order_placed', { order, context })
  }

  async function trackEvent(name: string, payload: Record<string, unknown> = {}): Promise<CommerceEvent> {
    const event: CommerceEvent = {
      name,
      payload,
      at: new Date().toISOString(),
    }
    events.push(event)

    if (client && typeof client.trackEvent === 'function') {
      await client.trackEvent(event)
    }

    return event
  }

  async function trackPageView(path: string, title?: string) {
    return trackEvent('page_view', { path, title })
  }

  function getEvents(): CommerceEvent[] {
    return [...events]
  }

  function clearEvents() {
    events.length = 0
  }

  return {
    trackProductView,
    trackOrderPlaced,
    trackPageView,
    trackEvent,
    getEvents,
    clearEvents,
  }
}

export const useStatistics = useStastics

export default useStastics
