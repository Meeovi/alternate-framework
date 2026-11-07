// Sends Meeovi's new items, edits and deletions to fediverse followers every
// couple of minutes (server/utils/activitypub/publisher.ts). Only where
// ACTIVITYPUB_FEDERATION=true (meeovi.com), and never while prerendering.
// Deletions are checked every ten minutes. ACTIVITYPUB_PUBLISHER=false
// keeps the accounts and inbox answering but sends nothing (local testing
// against the shared database).
import federation from '../federation'
import { federationEnabled } from '../utils/activitypub/config'
import { runPublisher } from '../utils/activitypub/publisher'

const EVERY_MS = 2 * 60 * 1000
const DELETIONS_EVERY = 5 // runs

export default defineNitroPlugin(() => {
  if (!federationEnabled() || import.meta.prerender || process.env.ACTIVITYPUB_PUBLISHER === 'false') return
  let runs = 0
  const run = () => {
    runs++
    runPublisher(federation, { deletions: runs % DELETIONS_EVERY === 1 })
      .catch((error) => console.error('[activitypub] run failed', error))
  }
  setTimeout(run, 60 * 1000).unref?.()
  setInterval(run, EVERY_MS).unref?.()
})
