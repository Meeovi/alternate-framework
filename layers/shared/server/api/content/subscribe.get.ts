import { defineEventHandler, createError, getQuery, createEventStream } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'

// SSE bridge for live content-change events — the adapter owns the real
// transport (Directus realtime is a WebSocket, another backend might poll),
// the browser only ever sees a plain EventSource stream regardless of which
// one is active.
export default defineEventHandler(async (event) => {
  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter?.subscribeToCollection) {
    throw createError({ statusCode: 501, statusMessage: 'The active content backend does not support live updates' })
  }

  const query = getQuery(event)
  const collection = String(query.collection || '')
  const userField = String(query.userField || 'user_created')
  const userId = String(query.userId || '')

  if (!collection) {
    throw createError({ statusCode: 400, statusMessage: 'Missing collection' })
  }

  const eventStream = createEventStream(event)

  const filter = userId ? { [userField]: { _eq: userId } } : {}
  const unsubscribe = await adapter.subscribeToCollection(collection, filter, (change) => {
    eventStream.push(JSON.stringify(change))
  })

  eventStream.onClosed(() => {
    unsubscribe()
  })

  return eventStream.send()
})
