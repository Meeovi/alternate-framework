import type { ExperienceComponentDefinition } from '../types'

export const spaceActivity: ExperienceComponentDefinition = {
  id: 'space.activity',
  label: 'Recent Activity',
  category: 'space',
  domain: 'space',
  icon: 'i-heroicons-clock',
  vueComponent: 'SpacesActivity',
  propsSchema: [
    { name: 'max', type: 'number', label: 'Max items', default: 5 }
  ],
  defaultProps: {
    max: 5
  },
  grapes: {
    type: 'space-activity',
    traits: [
      { type: 'number', name: 'max', label: 'Max items' }
    ]
  }
}
