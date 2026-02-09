import type { ApiPluginContext } from './types'
import { registerFetcher, setActiveFetcher } from '../fetcher/fetcherRegistry'

export type ApiPlugin = (ctx: ApiPluginContext) => void

export function defineApiPlugin(plugin: ApiPlugin) {
  const ctx: ApiPluginContext = {
    registerFetcher,
    setActiveFetcher
  }

  plugin(ctx)
}
