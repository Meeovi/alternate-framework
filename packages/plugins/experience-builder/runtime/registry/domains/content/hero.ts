import type { ExperienceComponentDefinition } from '../../types'

export const hero: ExperienceComponentDefinition = {
  id: 'content.hero',
  label: 'Hero',
  category: 'content',
  domain: 'content',
  vueComponent: 'Hero',
  propsSchema: [
    { name: 'title', type: 'string', label: 'Title', default: '' },
    { name: 'subtitle', type: 'string', label: 'Subtitle', default: '' },
    { name: 'backgroundImage', type: 'string', label: 'Background Image URL', default: '' }
  ],
  defaultProps: { title: '', subtitle: '', backgroundImage: '' },
  grapes: {
    type: 'content-hero',
    traits: [
      { type: 'text', name: 'title', label: 'Title' },
      { type: 'text', name: 'subtitle', label: 'Subtitle' },
      { type: 'text', name: 'backgroundImage', label: 'Background Image URL' }
    ]
  }
}