import type { ExperienceComponentDefinition } from '../../types'

export const productGrid: ExperienceComponentDefinition = {
  id: 'commerce.product-grid',
  label: 'Product Grid',
  category: 'commerce',
  domain: 'commerce',
  vueComponent: 'ProductGrid',
  propsSchema: [
    { name: 'products', type: 'array', label: 'Products', default: [] }
  ],
  defaultProps: { products: [] },
  grapes: {
    type: 'commerce-product-grid',
    traits: [{ type: 'array', name: 'products', label: 'Products' }]
  }
}