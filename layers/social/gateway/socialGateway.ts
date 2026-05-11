import type { GatewayContract } from '@mframework/core'

async function content(query: unknown) {
  const nuxtApp = useNuxtApp()
  const adapter = (nuxtApp as any).$adapter
    || (nuxtApp as any).$contentClient
    || (globalThis as any).__adapter

  if (adapter?.request)
    return await adapter.request(query)

  throw new Error('Social content gateway is not available')
}

export default <GatewayContract & { content: typeof content }>{
  cart: {
    async get() {
      return {
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          currency: 'USD',
        },
      }
    },
    async add() {},
    async remove() {},
  },
  content,
}
