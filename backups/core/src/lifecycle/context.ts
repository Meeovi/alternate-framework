// src/lifecycle/context.ts

import type { MAppContext as MAppContextCompat } from '../compat'

export interface DataRegistry {
  // define your real API here
  createCollection: (name: string, options?: any) => {
    add: (node: any) => void
  }
}

export interface Router {
  addRoute: (route: {
    path: string
    component: string
    meta?: Record<string, any>
  }) => void
}

export interface BuildConfig {
  // this can be Webpack, Vite, or your own abstraction
  [key: string]: any
}

export interface MAppContext extends MAppContextCompat {
  data: DataRegistry
  router: Router
  buildConfig: BuildConfig
  compatState: Record<string, any>
}

export function createMAppContext(params: {
  appRoot: string
  env?: 'development' | 'production' | 'test'
  data: DataRegistry
  router: Router
  buildConfig: BuildConfig
}): MAppContext {
  return {
    appRoot: params.appRoot,
    env: params.env ?? (process.env.NODE_ENV as any) ?? 'development',
    data: params.data,
    router: params.router,
    buildConfig: params.buildConfig,
    compatState: Object.create(null),
  }
}
