import type { ExperienceComponentDefinition } from '../types'

export const spaceMembers: ExperienceComponentDefinition = {
  id: 'space.members',
  label: 'Space Members',
  category: 'space',
  domain: 'space',
  icon: 'i-heroicons-users',
  vueComponent: 'SpacesMembers',
  propsSchema: [
    {
      name: 'max',
      type: 'number',
      label: 'Max members to show',
      default: 10
    },
    {
      name: 'showAvatars',
      type: 'boolean',
      label: 'Show avatars',
      default: true
    }
  ],
  defaultProps: {
    max: 10,
    showAvatars: true
  },
  grapes: {
    type: 'space-members',
    traits: [
      { type: 'number', name: 'max', label: 'Max members' },
      { type: 'checkbox', name: 'showAvatars', label: 'Show avatars' }
    ]
  }
}
