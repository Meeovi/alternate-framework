import { CategoryInterface } from '../client/sdk'
import { CommerceCategory } from '@mframework/core'

export function mapMagentoCategory(category: CategoryInterface): CommerceCategory {
  return {
    id: category.uid,
    slug: category.url_key ?? category.uid,
    name: category.name as any,
    parentId: undefined, // Magento tree is nested; parentId can be derived if needed
    children: (category.children ?? []).map(mapMagentoCategory),
  }
}