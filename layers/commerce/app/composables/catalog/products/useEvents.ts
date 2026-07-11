// layers/commerce/app/composables/catalog/products/useEvents.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { EventProvider, Event } from '../../../types/events'

/**
 * Event (ticketed) composable. Replaces the old `useEvents.ts`, typed against
 * the `EventProvider` contract.
 */
export function useEvents() {
  const client = getCommerceClient() as unknown as EventProvider
  const events = ref<Event[]>([])
  const current = ref<Event | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchEvents(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      events.value = (await client.getEvents(params)).items
    } catch (err) {
      error.value = err as Error
      events.value = []
    } finally {
      isLoading.value = false
    }
    return events.value
  }

  async function fetchEventById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getEventById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEventBySlug(slug: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getEventBySlug(slug)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function registerAttendee(input: Parameters<EventProvider['registerAttendee']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      return await client.registerAttendee(input)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    events,
    current,
    isLoading,
    error,
    fetchEvents,
    fetchEventById,
    fetchEventBySlug,
    registerAttendee,
  }
}

export default useEvents
