import {
  markRaw,
} from 'vue'
import {
  type JsonFormsCellRendererRegistryEntry,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'

export interface JsonFormsVuetifyRegistry {
  renderers: JsonFormsRendererRegistryEntry[]
  cells: JsonFormsCellRendererRegistryEntry[]
}

export async function createJsonFormsVuetifyRegistry(): Promise<JsonFormsVuetifyRegistry> {
  const { extendedVuetifyRenderers } = await import('@jsonforms/vue-vuetify')
  const { fileUploadRenderer } = await import('./custom/fileupload.renderer.js')
  const { richtextRenderer } = await import('./custom/richtext.renderer.js')
  const { repeaterRenderer } = await import('./custom/repeater.renderer.js')

  return {
    renderers: markRaw([
      ...extendedVuetifyRenderers,
      richtextRenderer,
      fileUploadRenderer,
      repeaterRenderer,
    ]),
    cells: markRaw([]),
  }
}

export async function createDefaultJsonFormsRegistry(): Promise<JsonFormsVuetifyRegistry> {
  return createJsonFormsVuetifyRegistry()
}
