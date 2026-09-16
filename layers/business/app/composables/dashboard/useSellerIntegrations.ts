import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'connected', label: 'Connected' },
  { id: 'disconnected', label: 'Disconnected' },
  { id: 'error', label: 'Error' },
  { id: 'pending', label: 'Pending' }
]

/**
 * Third-party apps this seller has installed from the app store (see the
 * "Add a integration" link to /departments/appstore) — fetched through
 * `useBusinessDriver()`. Distinct from the `integrations` Directus
 * collection `dashboard/integration/[...slug].vue` reads, which is
 * app-store catalog content, not per-seller connection state.
 */
export function useSellerIntegrations() {
  const columns: IColumnConfig[] = [
    { id: 'name', header: [{ text: 'Integration' }, { filter: 'text' }], sort: true, flexgrow: 1 },
    { id: 'provider', header: 'Provider', width: 150, sort: true },
    { id: 'category', header: 'Category', width: 140, sort: true },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      editor: 'richselect',
      options: STATUS_OPTIONS,
      width: 140
    },
    { id: 'connected', header: 'Connected', width: 130, sort: true, template: (value: string | null) => value ? new Date(value).toLocaleDateString() : '—' }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-integrations',
    () => business.integrations.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
