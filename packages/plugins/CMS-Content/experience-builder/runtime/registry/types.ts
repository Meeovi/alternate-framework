export type ExperienceDomain =
  | 'layout'
  | 'content'
  | 'space'
  | 'commerce'
  | 'search'
  | 'user'
  | 'media'
  | 'analytics'
  | 'custom'

export interface ExperienceComponentDefinition {
  id: string
  label: string
  category: string
  domain: ExperienceDomain
  icon?: string
  vueComponent: string
  propsSchema: any[]
  defaultProps?: Record<string, any>
  grapes: { type: string; traits?: any[] }
  requires?: {
    search?: boolean
    commerce?: boolean
    media?: boolean
    analytics?: boolean
  }
}
