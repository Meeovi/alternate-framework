import { registry } from '../index'

export function getComponentsForEntity(entityType: string) {
  if (entityType === 'space') {
    return registry
  }

  if (entityType === 'shop') {
    return registry.filter(c =>
      ['layout', 'commerce', 'search', 'content', 'media', 'analytics'].includes(c.domain)
    )
  }

  if (entityType === 'user') {
    return registry.filter(c =>
      ['layout', 'user', 'content', 'activity'].includes(c.domain)
    )
  }

  return registry
}
