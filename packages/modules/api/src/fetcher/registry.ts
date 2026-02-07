
import { Fetcher } from './types'

let activeFetcher: Fetcher | null = null

export function setFetcher(fetcher: Fetcher) {
  activeFetcher = fetcher
}

export function getFetcher(): Fetcher {
  if (!activeFetcher) {
    throw new Error('No fetcher has been set. Call setFetcher() first.')
  }
  return activeFetcher
}
