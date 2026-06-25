import type { ExperienceComponentDefinition } from '../types'

export const contentHero: ExperienceComponentDefinition = {
  id: 'content.hero',
  label: 'Hero Banner',
  category: 'content',
  domain: 'content',
  icon: 'i-heroicons-photo',
  vueComponent: 'SpacesHero',
  propsSchema: [
    { name: 'title', type: 'string', label: 'Title', required: true },
    { name: 'subtitle', type: 'string', label: 'Subtitle' },
    { name: 'ctaLabel', type: 'string', label: 'CTA Label' },
    { name: 'ctaHref', type: 'string', label: 'CTA Link' }
  ],
  defaultProps: {
    title: 'Welcome',
    subtitle: '',
    ctaLabel: '',
    ctaHref: ''
  },
  grapes: {
    type: 'content-hero',
    traits: [
      { type: 'text', name: 'title', label: 'Title' },
      { type: 'text', name: 'subtitle', label: 'Subtitle' },
      { type: 'text', name: 'ctaLabel', label: 'CTA Label' },
      { type: 'text', name: 'ctaHref', label: 'CTA Link' }
    ]
  }
}
