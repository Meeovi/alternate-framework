import { createDefaultRendererRegistry } from './renderers/index.js'

export interface UiFormsPluginOptions {
  rendererRegistry?: Record<string, unknown>
}

export interface UiFormsApi {
  getRenderers: () => Record<string, unknown>
}

export function createUiFormsPlugin(nuxtApp: any, options: UiFormsPluginOptions = {}): UiFormsApi {
  const renderers = options.rendererRegistry || createDefaultRendererRegistry()
  const api: UiFormsApi = {
    getRenderers: () => renderers,
  }

  if (nuxtApp && typeof nuxtApp.provide === 'function') {
    nuxtApp.provide('uiForms', api)
  }

  return api
}
