import { defineNitroPlugin } from 'nitropack/runtime'
import { getCommerceAdapterRegistration } from '../adapters'

export default defineNitroPlugin(() => {
  try {
    // Preload adapter registration config at startup to fail early on bad env.
    void getCommerceAdapterRegistration()
  } catch {
    // best-effort warmup; registration plugin handles runtime logging
  }
})
