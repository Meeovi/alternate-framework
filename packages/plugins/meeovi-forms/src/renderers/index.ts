import { createDefaultJsonFormsRegistry } from './vuetify.js'
import type {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'

export interface UiFormsRendererRegistry {
  renderers: JsonFormsRendererRegistryEntry[]
  cells: JsonFormsCellRendererRegistryEntry[]
}

export * from './vuetify.js'

export function createDefaultRendererRegistry(): UiFormsRendererRegistry {
  return createDefaultJsonFormsRegistry()
}
