// Imports on a timer when wikipediaNews.intervalMinutes > 0 (first run a
// minute after start). Off by default; turn it on for one site only.
import { defineNitroPlugin } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'
import { runImport } from '../run'

export default defineNitroPlugin((nitro) => {
  const minutes = Number((useRuntimeConfig() as Record<string, any>).wikipediaNews?.intervalMinutes || 0)
  if (!(minutes > 0) || import.meta.prerender) return
  const tick = () => runImport()
    .then((r) => { if (r.added || r.errors.length) console.log(`[wikipedia-news] added ${r.added}, skipped ${r.skipped}${r.errors.length ? `, ${r.errors.length} errors` : ''}`) })
    .catch((error) => console.error('[wikipedia-news] scheduled import failed', error?.message || error))
  const first = setTimeout(tick, 60_000)
  const every = setInterval(tick, Math.max(15, minutes) * 60_000)
  nitro.hooks.hook('close', () => { clearTimeout(first); clearInterval(every) })
})
