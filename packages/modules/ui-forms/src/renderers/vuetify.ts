import {
  markRaw,
} from 'vue'
import * as VueVuetify from '@jsonforms/vue-vuetify'
import {
  type JsonFormsCellRendererRegistryEntry,
  type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
import { fileUploadRenderer } from './custom/fileupload.renderer.js'
import { richtextRenderer } from './custom/richtext.renderer.js'

export interface JsonFormsVuetifyRegistry {
  renderers: JsonFormsRendererRegistryEntry[]
  cells: JsonFormsCellRendererRegistryEntry[]
}

export function createJsonFormsVuetifyRegistry(): JsonFormsVuetifyRegistry {
  const extendedVuetifyRenderers = (
    VueVuetify as unknown as { extendedVuetifyRenderers: JsonFormsRendererRegistryEntry[] }
  ).extendedVuetifyRenderers

  return {
    renderers: markRaw([
      ...extendedVuetifyRenderers,
      richtextRenderer,
      fileUploadRenderer,
    ]),
    cells: markRaw([]),
  }
}

export function createDefaultJsonFormsRegistry(): JsonFormsVuetifyRegistry {
  return createJsonFormsVuetifyRegistry()
}
