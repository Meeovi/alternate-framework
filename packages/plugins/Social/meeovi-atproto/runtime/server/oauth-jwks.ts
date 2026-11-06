// GET /oauth/jwks.json — the public key of Meeovi's OAuth client
// (ATPROTO_OAUTH_PRIVATE_JWK's public half), which PDSes use to check the
// client's signed token requests.
import { createError, defineEventHandler, setResponseHeader } from 'h3'
import { oauthPublicJwks } from '../oauth'

export default defineEventHandler(async (event) => {
  const jwks = await oauthPublicJwks()
  if (!jwks) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  setResponseHeader(event, 'cache-control', 'public, max-age=600')
  return jwks
})
