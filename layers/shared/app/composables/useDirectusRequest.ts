import { useNuxtApp } from '#imports'

/**
 * Centralized safe wrapper around `$directus.request`.
 * Shows a toast error when the Directus client or `.request` is not available.
 */
export default function useDirectusRequest() {
  const nuxt = useNuxtApp() as any

  async function request(config: any) {
    try {
      const client = nuxt?.$directus
      if (!client || typeof client.request !== 'function') {
        try {
          const toast = nuxt?.$toast
          if (toast && typeof toast.error === 'function') toast.error('Directus client unavailable')
        } catch (_) {}
        throw new Error('Directus client.request is not available')
      }

      return await client.request(config)
    } catch (e) {
      try {
        const toast = nuxt?.$toast
        if (toast && typeof toast.error === 'function') toast.error('Request failed')
      } catch (_) {}
      throw e
    }
  }

  return { request }
}
