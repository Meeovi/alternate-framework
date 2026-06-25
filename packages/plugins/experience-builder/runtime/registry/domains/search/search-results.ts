import type { ExperienceComponentDefinition } from '../../types'

export const searchResults: ExperienceComponentDefinition = {
  id: 'search.results',
  label: 'Search Results',
  category: 'search',
  domain: 'search',
  vueComponent: 'SearchResults',
  propsSchema: [],
  defaultProps: {},
  grapes: {
    type: 'search-results'
  }
}