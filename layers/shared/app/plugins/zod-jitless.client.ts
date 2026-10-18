import { config } from 'zod'

/**
 * Zod 4 probes for eval support (`Function('')`) the first time a schema is
 * parsed, to decide whether to compile fast parsers. The site CSP has no
 * 'unsafe-eval', so the probe is refused and reported as a violation on
 * every page that validates a form. Tell Zod up front not to try.
 */
export default defineNuxtPlugin({
  name: 'zod-jitless',
  enforce: 'pre',
  setup() {
    config({ jitless: true })
  },
})
