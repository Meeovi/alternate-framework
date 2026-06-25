import type { ExperienceComponentDefinition } from '../../types'

export const activity: ExperienceComponentDefinition = {
  id: 'space.activity',
  label: 'Activity',
  category: 'space',
  domain: 'space',
  vueComponent: 'Activity',
  propsSchema: [],
  defaultProps: {},
  grapes: {
    type: 'space-activity'
  }
}