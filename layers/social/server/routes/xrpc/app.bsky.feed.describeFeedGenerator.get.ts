import { createError, defineEventHandler } from 'h3'
import { FEEDS, feedPublisherDid, feedgenDid } from '../../utils/feedgen'

/** app.bsky.feed.describeFeedGenerator: the feeds Meeovi serves (server/utils/feedgen.ts). */
export default defineEventHandler(() => {
  const did = feedgenDid()
  const publisher = feedPublisherDid()
  if (!did || !publisher) throw createError({ statusCode: 501, statusMessage: 'MethodNotImplemented' })
  return {
    did,
    feeds: FEEDS.map((feed) => ({ uri: `at://${publisher}/app.bsky.feed.generator/${feed.rkey}` })),
  }
})
