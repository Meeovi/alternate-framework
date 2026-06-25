import type { ExperienceComponentDefinition } from '../../types'

export const section: ExperienceComponentDefinition = {
  id: 'layout.section',
  label: 'Section',
  category: 'layout',
  domain: 'layout',
  vueComponent: 'Section',
  propsSchema: [
    { name: 'backgroundColor', type: 'string', label: 'Background Color', default: '#ffffff' },
    { name: 'padding', type: 'string', label: 'Padding', default: '20px' }
  ],
  defaultProps: { backgroundColor: '#ffffff', padding: '20px' },
  grapes: {
    type: 'layout-section',
    traits: [
      { type: 'string', name: 'backgroundColor', label: 'Background Color' },
      { type: 'string', name: 'padding', label: 'Padding' }
    ]
  }
}