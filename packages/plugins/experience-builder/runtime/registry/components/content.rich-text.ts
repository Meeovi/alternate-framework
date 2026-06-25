import type { ExperienceComponentDefinition } from '../types'

export const contentRichText: ExperienceComponentDefinition = {
  id: 'content.rich-text',
  label: 'Rich Text',
  category: 'content',
  domain: 'content',
  icon: 'i-heroicons-document-text',
  vueComponent: 'SpacesRichText',
  propsSchema: [
    {
      name: 'html',
      type: 'string',
      label: 'Content (HTML)',
      required: true,
      default: ''
    }
  ],
  defaultProps: {
    html: ''
  },
  grapes: {
    type: 'content-rich-text',
    traits: [
      {
        type: 'textarea',
        name: 'html',
        label: 'HTML'
      }
    ]
  }
}
