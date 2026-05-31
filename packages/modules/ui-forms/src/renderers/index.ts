import { createVuetifyRendererRegistry } from './vuetify.js'
import { richTextRenderer } from './custom/richtext.renderer.js'
import { fileUploadRenderer } from './custom/fileupload.renderer.js'
import { relationRenderer } from './custom/relation.renderer.js'

export interface RendererDefinition {
  key: string
  tester: (scope: string, schema: Record<string, any>) => boolean
  component: string
}

export function createDefaultRendererRegistry(): Record<string, unknown> {
  return {
    ...createVuetifyRendererRegistry(),
    custom: [richTextRenderer, fileUploadRenderer, relationRenderer],
  }
}
