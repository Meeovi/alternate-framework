import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const TYPE_OPTIONS = [
  { id: 'text', label: 'Text' },
  { id: 'number', label: 'Number' },
  { id: 'boolean', label: 'Boolean' },
  { id: 'select', label: 'Select' },
  { id: 'multiselect', label: 'Multi-select' }
]

/**
 * Seller-defined product attributes — fetched through
 * `useBusinessDriver()`. `updateAttribute.vue` / `updateAttributeSet.vue`
 * in layers/commerce show the existing attribute-editing UI a real backend
 * adapter for this driver should eventually reuse.
 */
export function useSellerAttributes() {
  const columns: IColumnConfig[] = [
    { id: 'name', header: [{ text: 'Attribute' }, { filter: 'text' }], editor: 'text', sort: true, flexgrow: 1 },
    { id: 'code', header: 'Code', width: 140, sort: true },
    {
      id: 'type',
      header: { text: 'Type', filter: { type: 'richselect', config: { options: TYPE_OPTIONS } } },
      editor: 'richselect',
      options: TYPE_OPTIONS,
      width: 140
    },
    { id: 'values', header: 'Values', flexgrow: 2 },
    { id: 'usedBy', header: 'Used By', width: 110, sort: true, template: (value: number) => `${value} products` }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-attributes',
    () => business.attributes.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
