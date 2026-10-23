import { defineOperationApp } from '@directus/extensions-sdk'

const SECTIONS = [
  { text: 'Everything', value: 'all' },
  { text: 'Products', value: 'products' },
  { text: 'Categories', value: 'categories' },
  { text: 'Orders', value: 'orders' },
  { text: 'Customers', value: 'customers' },
]

export default defineOperationApp({
  id: 'mageos-sync',
  name: 'Mage-OS sync',
  icon: 'sync',
  description: 'Copy products, categories, orders and customers from the Mage-OS store into Directus.',
  overview: ({ section }) => [
    { label: 'Section', text: SECTIONS.find((s) => s.value === (section || 'all'))?.text ?? String(section) },
  ],
  options: [
    {
      field: 'section',
      name: 'Section',
      type: 'string',
      meta: { width: 'full', interface: 'select-dropdown', options: { choices: SECTIONS } },
      schema: { default_value: 'all' },
    },
  ],
})
