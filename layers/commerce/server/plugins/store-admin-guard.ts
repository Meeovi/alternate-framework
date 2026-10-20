import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'

/**
 * /workspace store admin (meeovi-tables' guard,
 * `Symbol.for('mframework.tables.guard')`): a store customer that's linked
 * to a Meeovi account can't be deleted from the customers table — the
 * account's checkout and purchase history would point at a customer that
 * no longer exists. Delete (or unlink) the account first.
 */
export default defineNitroPlugin(() => {
  ;(globalThis as Record<symbol, unknown>)[Symbol.for('mframework.tables.guard')] = {
    async beforeWrite(write: { action: string, source: string, collection: string, id?: string | number }) {
      if (write.source !== 'magento' || write.collection !== 'customers' || write.action !== 'remove') return
      const id = Number(write.id)
      if (!Number.isInteger(id)) return
      const [linked] = await db.select({ username: users.username, email: users.email })
        .from(users).where(eq(users.magentoCustomerId, id)).limit(1)
      if (linked) {
        throw createError({
          statusCode: 409,
          statusMessage: `This customer belongs to the Meeovi account ${linked.username || linked.email}. Delete that account first.`,
        })
      }
    },
  }
})
