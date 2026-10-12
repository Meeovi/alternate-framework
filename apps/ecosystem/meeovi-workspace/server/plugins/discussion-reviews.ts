import { queryRows, registerTableSource } from '@mframework/meeovi-tables/sources'
import { recentMessages } from '@mframework/meeovi-discussions/server'

/**
 * Seller reviews for the workspace's /marketing/reviews table: messages in
 * the live discussions of products and outlets (Rocket.Chat rooms from
 * @mframework/meeovi-discussions). Read-only. Until Rocket.Chat is
 * configured (ROCKETCHAT_ADMIN_USER_ID / ROCKETCHAT_ADMIN_TOKEN) the table
 * shows "No reviews yet."
 */
const TTL_MS = 60 * 1000
let cache: { at: number, rows: Record<string, unknown>[] } | null = null

async function reviewRows() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows
  const messages = await recentMessages(undefined, ['product', 'outlet'])
  const rows = messages.map((m) => ({
    id: m.id,
    review: m.text.slice(0, 500),
    author: m.author,
    about: m.topic || m.room,
    room: m.room,
    date: m.date,
  }))
  cache = { at: Date.now(), rows }
  return rows
}

export default defineNitroPlugin(() => {
  const configured = Boolean(process.env.ROCKETCHAT_ADMIN_USER_ID && process.env.ROCKETCHAT_ADMIN_TOKEN)

  registerTableSource({
    id: 'discussions',
    label: 'Live discussions',
    handles: (collection) => collection === 'reviews' && configured,
    async list(query) {
      return queryRows(await reviewRows(), query)
    },
    async schema() {
      return [
        { field: 'id', label: 'ID', type: 'string', hidden: true, readonly: true, primary: true },
        { field: 'review', label: 'Message', type: 'text', sortable: true },
        { field: 'author', label: 'Author', type: 'string', narrow: true, sortable: true },
        { field: 'about', label: 'Product / Outlet', type: 'string', sortable: true },
        { field: 'room', label: 'Room', type: 'string', hidden: true, sortable: true },
        { field: 'date', label: 'Date', type: 'datetime', sortable: true },
      ]
    },
  })
})
