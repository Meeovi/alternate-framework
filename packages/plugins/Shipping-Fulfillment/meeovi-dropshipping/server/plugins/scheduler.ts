import { dropshipConfig } from '../utils/context'
import { forwardOrders, syncStock, syncTracking } from '../utils/jobs'
import { store } from '../utils/store'

/**
 * Background jobs: forward paid orders + pull tracking (default every 10
 * minutes), and refresh stock/prices (default hourly). Production only
 * unless `sync.enabled` is set explicitly. One run at a time per job — a
 * slow supplier never stacks runs.
 */
export default defineNitroPlugin(() => {
  const own = (useRuntimeConfig() as Record<string, any>).meeoviDropshipping ?? {}
  const enabled = own.sync?.enabled ?? process.env.NODE_ENV === 'production'
  if (!enabled || (import.meta as { prerender?: boolean }).prerender) return
  const config = dropshipConfig()
  if (!config.directus.url || !config.secret || !config.magento.graphqlUrl) {
    console.warn('[dropshipping] not configured (Directus, NUXT_DROPSHIP_SECRET or Magento Integration missing) — jobs off')
    return
  }

  const every = (minutes: unknown, fallback: number) => Math.max(5, Number(minutes) || fallback) * 60_000
  const running = new Set<string>()
  const job = (name: string, work: () => Promise<void>) => async () => {
    if (running.has(name)) return
    running.add(name)
    try {
      await work()
    } catch (error) {
      console.error(`[dropshipping] ${name} failed:`, (error as Error)?.message || error)
    } finally {
      running.delete(name)
    }
  }

  const orders = job('orders', async () => {
    const connections = (await store().connections.active()).filter((c) => c.status === 'active')
    await forwardOrders(connections)
    await syncTracking()
  })
  const stock = job('stock', async () => {
    for (const connection of await store().connections.active()) {
      if (connection.status !== 'active') continue
      await syncStock(connection).catch(async (error) => {
        await store().connections.update(connection.id, { last_error: String((error as Error).message).slice(0, 500) })
      })
    }
  })

  setTimeout(orders, 2 * 60_000).unref?.()
  setInterval(orders, every(own.sync?.ordersEveryMinutes, 10)).unref?.()
  setInterval(stock, every(own.sync?.stockEveryMinutes, 60)).unref?.()
})
