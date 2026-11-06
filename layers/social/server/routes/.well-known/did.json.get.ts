import { createError, defineEventHandler, setResponseHeader } from 'h3'
import { feedgenDid, feedgenHostname } from '../../utils/feedgen'

/**
 * did:web document of Meeovi's Bluesky feed generator (server/utils/feedgen.ts):
 * Bluesky's AppView reads it to find where to ask for feed skeletons.
 * Only served when ATPROTO_FEEDGEN_HOSTNAME is set.
 */
export default defineEventHandler((event) => {
  const did = feedgenDid()
  const host = feedgenHostname()
  if (!did || !host) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: did,
    service: [{ id: '#bsky_fg', type: 'BskyFeedGenerator', serviceEndpoint: `https://${host}` }],
  }
})
