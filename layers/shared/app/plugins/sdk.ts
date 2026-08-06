import { sdk, initGateway } from 'alternate-sdk'

/**
 * Nuxt plugin that provides the `alternate-sdk` to the Nuxt context.
 *
 * `initGateway()` reads runtime config, resolves adapter implementations
 * (Directus, social, commerce, search, auth, etc.) and wires them into
 * the `sdk` singleton + `globalThis.useGateway()`.
 *
 * Previously this ran on both server and client. On the client side,
 * `initGateway()` would attempt to create server-side SDK connections
 * (Directus clients, Stripe clients, etc.) which are not valid in a
 * browser context. Now we guard with `import.meta.server` so the gateway
 * is only initialised on the server. The `sdk` object is still provided
 * to the client (empty objects), and frontend composables should use
 * `$fetch` to server API endpoints instead of accessing `$sdk` directly.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    initGateway(nuxtApp)
  }

  return {
    provide: {
      sdk
    }
  }
})
