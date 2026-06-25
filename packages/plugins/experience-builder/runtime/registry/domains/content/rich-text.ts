import type { ExperienceComponentDefinition } from '../../types'

export const richText: ExperienceComponentDefinition = {
  id: 'content.rich-text',
  label: 'Rich Text',
  category: 'content',
  domain: 'content',
  vueComponent: 'RichText',
  propsSchema: [
    { name: 'html', type: 'string', label: 'HTML', default: '' }
  ],
  defaultProps: { html: '' },
  grapes: {
    type: 'content-rich-text',
    traits: [{ type: 'textarea', name: 'html', label: 'HTML' }]
  }
}
