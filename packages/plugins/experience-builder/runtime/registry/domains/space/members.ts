import type { ExperienceComponentDefinition } from '../../types'

export const members: ExperienceComponentDefinition = {
  id: 'space.members',
  label: 'Members',
  category: 'space',
  domain: 'space',
  vueComponent: 'Members',
  propsSchema: [],
  defaultProps: {},
  grapes: {
    type: 'space-members'
  }
}