import { createDefaultRendererRegistry, type UiFormsRendererRegistry } from './renderers/index.js'

export interface MeeoviFormsPluginOptions {
  rendererRegistry?: UiFormsRendererRegistry
}

export interface MeeoviFormsApi {
  getRenderers: () => UiFormsRendererRegistry
}

export const faIconAliases = {
  jsonForm: 'fas fa-list-ul',
  jsonForms: 'fas fa-list-ul',
  form: 'fas fa-align-left',
  formGroup: 'fas fa-layer-group',
  formField: 'fas fa-font',
  submit: 'fas fa-paper-plane',
  reset: 'fas fa-undo',
  upload: 'fas fa-cloud-upload-alt',
  richText: 'fas fa-align-left',
  calendar: 'far fa-calendar-alt',
  select: 'fas fa-chevron-down',
  file: 'fas fa-file',
}

export function createMeeoviFormsPlugin(nuxtApp: any, options: MeeoviFormsPluginOptions = {}): MeeoviFormsApi {
  const renderers = options.rendererRegistry || createDefaultRendererRegistry()
  const api: MeeoviFormsApi = {
    getRenderers: () => renderers,
  }

  if (nuxtApp && typeof nuxtApp.provide === 'function') {
    nuxtApp.provide('meeoviForms', api)
  }

  return api
}
