// GET /oauth-client-metadata.json — Meeovi's AT Protocol OAuth client
// metadata; its URL is the client_id PDSes look up when a member signs in
// with Bluesky (runtime/oauth.ts). 404 in development (loopback client).
import { createError, defineEventHandler, setResponseHeader } from 'h3'
import { oauthClientMetadata } from '../oauth'

export default defineEventHandler((event) => {
  const metadata = oauthClientMetadata()
  if (!metadata) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  setResponseHeader(event, 'cache-control', 'public, max-age=600')
  return metadata
})
