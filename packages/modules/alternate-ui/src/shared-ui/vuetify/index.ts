import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import { createVuetifyOptions, type AlternateVuetifyOptions } from './options'
import { vuetifyLabComponents } from './labs-components'

export function createVuetifyInstance(overrides: Partial<AlternateVuetifyOptions> = {}) {
  const options = createVuetifyOptions(overrides)

  return createVuetify({
    ...options,
    components: {
      ...vuetifyComponents,
      ...vuetifyLabComponents,
      ...(options.components ?? {}),
    },
    directives: {
      ...vuetifyDirectives,
      ...(options.directives ?? {}),
    },
  } as Parameters<typeof createVuetify>[0])
}

export { vuetifyComponents, vuetifyDirectives }
export * from './options'
export * from './theme'
export * from './blueprint'
export * from './labs'
export * from './labs-components'