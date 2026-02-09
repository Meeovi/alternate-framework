import {
  GridsomeAPI,
  LoadSourceFn,
  CreatePagesFn,
  ConfigureWebpackFn,
  LoadSourceActions,
  CreatePagesContext,
} from './types'

export interface CollectedHooks {
  loadSourceFns: LoadSourceFn[]
  createPagesFns: CreatePagesFn[]
  configureWebpackFns: ConfigureWebpackFn[]
}

export function createGridsomeAPIShim(): { api: GridsomeAPI; hooks: CollectedHooks } {
  const hooks: CollectedHooks = {
    loadSourceFns: [],
    createPagesFns: [],
    configureWebpackFns: [],
  }

  const api: GridsomeAPI = {
    loadSource(fn) {
      hooks.loadSourceFns.push(fn)
    },
    createPages(fn) {
      hooks.createPagesFns.push(fn)
    },
    configureWebpack(fn) {
      hooks.configureWebpackFns.push(fn)
    },
  }

  return { api, hooks }
}
