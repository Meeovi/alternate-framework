import { createDefaultRendererRegistry, type UiFormsRendererRegistry } from './renderers/index.js'

export interface MeeoviFormsPluginOptions {
  rendererRegistry?: UiFormsRendererRegistry
}

export interface MeeoviFormsApi {
  getRenderers: () => UiFormsRendererRegistry
}

export { faIconAliases } from './icons.js'

export async function createMeeoviFormsPlugin(nuxtApp: any, options: MeeoviFormsPluginOptions = {}): Promise<MeeoviFormsApi> {
  const renderers = options.rendererRegistry || await createDefaultRendererRegistry()
  const api: MeeoviFormsApi = {
    getRenderers: () => renderers,
  }

  if (nuxtApp && typeof nuxtApp.provide === 'function') {
    nuxtApp.provide('meeoviForms', api)
  }

  return api
}
