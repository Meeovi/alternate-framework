import { createDefaultRendererRegistry, type UiFormsRendererRegistry } from './renderers/index.js'

export interface UiFormsPluginOptions {
  rendererRegistry?: UiFormsRendererRegistry
}

export interface UiFormsApi {
  getRenderers: () => UiFormsRendererRegistry
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
