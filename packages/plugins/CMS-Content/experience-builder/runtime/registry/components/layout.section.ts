import type { ExperienceComponentDefinition } from '../types'

export const layoutSection: ExperienceComponentDefinition = {
  id: 'layout.section',
  label: 'Section',
  category: 'layout',
  domain: 'layout',
  icon: 'i-heroicons-rectangle-group',
  vueComponent: 'SpacesLayoutSection',
  propsSchema: [
    { name: 'background', type: 'string', label: 'Background', default: 'transparent' },
    { name: 'padding', type: 'string', label: 'Padding', default: '2rem' }
  ],
  defaultProps: {
    background: 'transparent',
    padding: '2rem'
  },
  grapes: {
    type: 'layout-section',
    traits: [
      { type: 'text', name: 'background', label: 'Background' },
      { type: 'text', name: 'padding', label: 'Padding' }
    ]
  }
}
