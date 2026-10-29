// One import run with this site's settings and Directus (server only).
import { createDirectus, createItem, readItems, rest, staticToken } from '@directus/sdk'
import { useRuntimeConfig } from '#imports'
import { importNews, type ImportResult } from '../importer'

let running: Promise<ImportResult> | null = null

/** Runs an import; a run already in progress is shared, not repeated. */
export function runImport(overrides: { days?: number, limit?: number } = {}): Promise<ImportResult> {
  if (running) return running
  const config = useRuntimeConfig() as Record<string, any>
  const settings = config.wikipediaNews || {}
  const url = String(config.public?.directus?.url || '').replace(/\/+$/, '')
  const token = String(config.directus?.token || '')
  if (!url || !token) return Promise.reject(new Error('Directus is not configured'))
  const directus = createDirectus(url).with(staticToken(token)).with(rest())

  running = importNews({
    source: { api: settings.api, userAgent: settings.userAgent },
    readItems: (collection, query) => directus.request(readItems(collection as any, query as any)) as Promise<Record<string, any>[]>,
    createItem: (collection, item) => directus.request(createItem(collection as any, item as any)) as Promise<Record<string, any>>,
    log: (message) => console.log(message),
  }, {
    space: settings.space,
    author: settings.author,
    days: overrides.days ?? (Number(settings.days) || 2),
    limit: overrides.limit ?? (Number(settings.limit) || 50),
  }).finally(() => { running = null })
  return running
}
