import { getComponentById } from '../index'

export function resolveRuntimeComponent(grapesComponent: any) {
  const type = grapesComponent.type || grapesComponent.get?.('type')
  const def = getComponentById(type)
  if (!def) return null

  const props = {
    ...(def.defaultProps || {}),
    ...(grapesComponent.props || grapesComponent.get?.('attributes') || {})
  }

  return { def, props }
}
