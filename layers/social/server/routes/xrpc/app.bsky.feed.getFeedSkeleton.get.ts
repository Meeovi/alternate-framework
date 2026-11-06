import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { feedPosts, feedPublisherDid, feedgenDid } from '../../utils/feedgen'

/**
 * app.bsky.feed.getFeedSkeleton for Meeovi's feeds (server/utils/feedgen.ts):
 * post URIs only, newest first; Bluesky apps load the posts themselves.
 * The cursor is an offset into the current list.
 */
const xrpcError = (event: Parameters<typeof setResponseStatus>[0], status: number, error: string, message: string) => {
  setResponseStatus(event, status)
  return { error, message }
}

export default defineEventHandler(async (event) => {
  const publisher = feedPublisherDid()
  if (!feedgenDid() || !publisher) return xrpcError(event, 501, 'MethodNotImplemented', 'Feeds are not enabled on this site')
  const query = getQuery(event)
  const match = /^at:\/\/([^/]+)\/app\.bsky\.feed\.generator\/([A-Za-z0-9._~-]{1,64})$/.exec(String(query.feed || ''))
  if (!match || match[1] !== publisher) return xrpcError(event, 400, 'UnknownFeed', 'Unknown feed')
  const posts = await feedPosts(match[2]!)
  if (!posts) return xrpcError(event, 400, 'UnknownFeed', 'Unknown feed')

  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
  const offset = /^\d{1,4}$/.test(String(query.cursor || '')) ? Number(query.cursor) : 0
  const page = posts.slice(offset, offset + limit)
  return {
    feed: page.map((post) => ({ post: post.id })),
    ...(offset + limit < posts.length ? { cursor: String(offset + limit) } : {}),
  }
})
