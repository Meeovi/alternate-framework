import { richText } from './domains/content/rich-text'
import { hero } from './domains/content/hero'
import { section } from './domains/layout/section'
import { members } from './domains/space/members'
import { activity } from './domains/space/activity'
import { productGrid } from './domains/commerce/product-grid'
import { searchResults } from './domains/search/search-results'

export const registry = [
  richText,
  hero,
  section,
  members,
  activity,
  productGrid,
  searchResults
]

export function getAllComponents() {
  return registry
}

export function getComponentById(id: string) {
  return registry.find(c => c.id === id)
}

export function getComponentsByDomain(domain: string) {
  return registry.filter(c => c.domain === domain)
}