export type GridsomePlugin = (api: GridsomeAPI, options?: any) => void

export interface GridsomeAPI {
  loadSource: (fn: LoadSourceFn) => void
  createPages: (fn: CreatePagesFn) => void
  configureWebpack: (fn: ConfigureWebpackFn) => void
  // extend as needed
}

export type LoadSourceFn = (actions: LoadSourceActions) => Promise<void> | void
export type CreatePagesFn = (ctx: CreatePagesContext) => Promise<void> | void
export type ConfigureWebpackFn = (config: any) => any | void

export interface LoadSourceActions {
  addCollection: (name: string, options?: any) => Collection
}

export interface Collection {
  addNode: (node: any) => void
}

export interface CreatePagesContext {
  createPage: (input: {
    path: string
    component: string
    context?: Record<string, any>
  }) => void
}
