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

export async function createDefaultRendererRegistry(): Promise<UiFormsRendererRegistry> {
  return createDefaultJsonFormsRegistry()
}
