import { getComponentById } from '../registry'

export function mapGrapesComponentToRuntime (component: any) {
  const type = component.type || component.get?.('type')
  const def = type && getComponentById(type)
  if (!def) return null

  const props = {
    ...(def.defaultProps || {}),
    ...(component.props || component.get?.('attributes') || {})
  }

  return {
    def,
    props
  }
}
