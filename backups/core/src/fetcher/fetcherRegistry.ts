import type { Fetcher } from './types'

const fetchers: Record<string, Fetcher> = {}
let activeFetcherName: string | null = null

export function registerFetcher(name: string, fetcher: Fetcher) {
  fetchers[name] = fetcher
}

export function setActiveFetcher(name: string) {
  if (!fetchers[name]) throw new Error(`Fetcher "${name}" not registered`)
  activeFetcherName = name
}

export function getFetcher(): Fetcher {
  if (!activeFetcherName) throw new Error('No active fetcher set')
  return fetchers[activeFetcherName]
}
