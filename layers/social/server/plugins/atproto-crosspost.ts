// Posts new products and opted-in members' notes to Bluesky every few
// minutes (server/utils/crosspost.ts). Only where ATPROTO_CROSSPOST=true
// (meeovi.com), and never while prerendering. Unpublished items' posts are
// removed every half hour.
import { crosspostEnabled, runCrosspost } from '../utils/crosspost'

const EVERY_MS = 5 * 60 * 1000
const REMOVE_EVERY = 6 // runs

export default defineNitroPlugin(() => {
  if (!crosspostEnabled() || import.meta.prerender) return
  let runs = 0
  const run = () => {
    runs++
    runCrosspost({ removeUnpublished: runs % REMOVE_EVERY === 1 })
      .catch((error) => console.error('[crosspost] run failed', error))
  }
  // First run a couple of minutes after boot (the site's Bluesky session signs in at boot).
  setTimeout(run, 2 * 60 * 1000).unref?.()
  setInterval(run, EVERY_MS).unref?.()
})
