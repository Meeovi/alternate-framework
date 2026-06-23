import { createDefaultRendererRegistry, type UiFormsRendererRegistry } from './renderers/index.js'

export interface UiFormsPluginOptions {
  rendererRegistry?: UiFormsRendererRegistry
}

export interface UiFormsApi {
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
