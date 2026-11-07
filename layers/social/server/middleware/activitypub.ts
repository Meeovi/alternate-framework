import { defineEventHandler, toWebRequest } from 'h3'
import federation from '../federation'

/**
 * Hands fediverse requests to Fedify (server/federation.ts); everything else
 * goes straight on to Nuxt.
 *
 * Used instead of the @fedify/nuxt module: that one runs Fedify on EVERY
 * request, and building a web Request starts draining a POST/PUT body into
 * a stream nobody reads — every later readBody() then hung forever (seen on
 * PUT /api/social/activitypub/settings). Only these paths can be Fedify's.
 *
 * A browser asking for an /ap/* id (HTML, so Fedify answers "not
 * acceptable") falls through to server/routes/ap/*, which redirect to the
 * page on Meeovi.
 */
const FEDERATION_PATH = /^\/(ap\/|\.well-known\/(webfinger|nodeinfo|x-nodeinfo2)$|nodeinfo\/)/

export default defineEventHandler(async (event) => {
  const path = (event.path || '/').split('?')[0]!
  if (!FEDERATION_PATH.test(path)) return
  let fallThrough = false
  const response = await federation.fetch(toWebRequest(event), {
    contextData: undefined,
    onNotFound: () => { fallThrough = true; return new Response(null, { status: 404 }) },
    onNotAcceptable: () => { fallThrough = true; return new Response(null, { status: 406 }) },
  })
  if (fallThrough) return
  return response
})
