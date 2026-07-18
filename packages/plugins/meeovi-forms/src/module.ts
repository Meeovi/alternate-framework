import { defineNuxtModule, addPlugin, createResolver, addComponentsDir, addImportsDir } from '@nuxt/kit'
import { fileURLToPath } from 'node:url'
import type { Nuxt } from '@nuxt/schema'

export interface ApiFormConfig {
  /** Unique name for this API form, used to select it at runtime */
  name: string
  /** JSON Schema for the form */
  schema: Record<string, any>
  /** Optional JSON UI Schema for the form */
  uiSchema?: Record<string, any>
  /** Default values for the form */
  defaults?: Record<string, any>
  /** Submit endpoint relative to public.apiBase */
  submitEndpoint?: string
  /** HTTP method for submission */
  submitMethod?: 'POST' | 'PUT' | 'PATCH'
}

export interface MeeoviFormsModuleOptions {
  /** Base URL for form submissions */
  apiBase?: string
  /** Array of API-backed form configurations */
  apis: ApiFormConfig[]
}

export default defineNuxtModule<MeeoviFormsModuleOptions>({
  meta: {
    name: 'meeovi-forms',
    configKey: 'meeoviForms',
    compatibility: {
      nuxt: '^4.0.0'
    }
  },
  defaults: {
    apiBase: '',
    apis: []
  },
  setup (options: MeeoviFormsModuleOptions, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    // Normalize API entries so runtime can rely on them being present
    const apis = (options.apis || []).map((api: ApiFormConfig) => ({
      name: api.name,
      schema: api.schema || { type: 'object', properties: {} },
      uiSchema: api.uiSchema || {},
      defaults: api.defaults || {},
      submitEndpoint: api.submitEndpoint || '',
      submitMethod: api.submitMethod || 'POST',
    }))

    // Provide runtime config so the frontend can read API definitions
    nuxt.options.runtimeConfig.public.meeoviForms = {
      ...(nuxt.options.runtimeConfig.public.meeoviForms || {}),
      apiBase: options.apiBase || '',
      apis
    }

    // Register runtime plugin
    addPlugin(resolver.resolve('./src/runtime/plugin'))

    // Register field/layout/control components
    addComponentsDir({
      path: resolver.resolve('./src/components'),
      pathPrefix: false,
    })

    // Register composables for auto-import
    addImportsDir(resolver.resolve('./src/composables'))
  }
})
