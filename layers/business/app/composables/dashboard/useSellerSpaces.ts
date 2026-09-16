import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const VISIBILITY_OPTIONS = [
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
  { id: 'invite_only', label: 'Invite Only' }
]

/**
 * Community spaces owned by this seller — fetched through
 * `useBusinessDriver()`. `layers/social`'s `useSpaces` covers communities
 * generally but has no owner-scoped query yet.
 */
export function useSellerSpaces() {
  const columns: IColumnConfig[] = [
    { id: 'name', header: [{ text: 'Space' }, { filter: 'text' }], editor: 'text', sort: true, flexgrow: 1 },
    { id: 'description', header: 'Description', flexgrow: 2 },
    { id: 'members', header: 'Members', width: 100, sort: true },
    { id: 'posts', header: 'Posts', width: 90, sort: true },
    {
      id: 'visibility',
      header: { text: 'Visibility', filter: { type: 'richselect', config: { options: VISIBILITY_OPTIONS } } },
      editor: 'richselect',
      options: VISIBILITY_OPTIONS,
      width: 140
    },
    { id: 'created', header: 'Created', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-spaces',
    () => business.spaces.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
