import type { ExperienceComponentDefinition } from '../../types'

export const analytics: ExperienceComponentDefinition = {
  id: 'space.analytics',
  label: 'Analytics',
  category: 'space',
  domain: 'space',
  vueComponent: 'Analytics',
  propsSchema: [],
  defaultProps: {},
  grapes: {
    type: 'space-analytics'
  }
}