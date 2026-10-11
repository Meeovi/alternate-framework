import { computed } from 'vue'
import type { WorkspaceMenu } from './useWorkspaceShell'

/**
 * Sidebar for the `workspace` layout, built from Directus `navigation`
 * records through the Directus SDK (`$directus` + `$readItems`, provided by
 * layers/commerce's directus plugin — server: real Directus + static token,
 * browser: the /api/cms proxy).
 *
 * The app lists the records, in order, in its app.config / nuxt.config:
 *   appConfig: { uiShell: { workspaceSidebar: [14, 20] } }
 *
 * Mapping (Directus has no nested-items collection, so it uses the
 * record's two repeater fields):
 *   navigation record      -> section; heading = `title` || `name`
 *   record.menus[]         -> items: name, url, icon (e.g. "fas fa-star"),
 *                             subtitle, active ("Disabled" greys it out)
 *   record.submenus[]      -> children of the menu item with the same `value`
 *                             (a menu item with children becomes collapsible)
 * http(s) urls open in a new tab. Sections are separated by dividers.
 *
 * Falls back to WORKSPACE_FALLBACK_MENU when no records are configured,
 * Directus is unreachable, or the records have no items — the sidebar is
 * never empty.
 */

interface DirectusNavEntry {
  name?: string | null
  url?: string | null
  icon?: string | null
  subtitle?: string | null
  active?: string | null
  value?: string | null
}

interface DirectusNavigation {
  id: number | string
  name?: string | null
  title?: string | null
  menus?: DirectusNavEntry[] | null
  submenus?: DirectusNavEntry[] | null
}

export const WORKSPACE_FALLBACK_MENU: WorkspaceMenu[] = [
  { header: 'Dashboard' },
  { title: 'Home', icon: 'fas fa-gauge', to: '/' },
  { title: 'Insights', icon: 'fas fa-chart-line', to: '/dashboard/insights' },
  { divider: true },
  { header: 'Manage your Shop' },
  {
    title: 'Sales',
    icon: 'fas fa-cash-register',
    children: [
      { title: 'Orders', to: '/dashboard/orders' },
      { title: 'Shipments', to: '/dashboard/shipments' },
      { title: 'Transactions', to: '/dashboard/transactions' },
      { title: 'Invoices', to: '/dashboard/invoices' },
      { title: 'Payouts', to: '/dashboard/payouts' }
    ]
  },
  {
    title: 'Catalog',
    icon: 'fas fa-boxes-stacked',
    children: [
      { title: 'Products', to: '/dashboard/products' },
      { title: 'Featured Products', to: '/dashboard/featured-products' },
      { title: 'Attributes', to: '/dashboard/attributes' },
      { title: 'Low Stock', to: '/dashboard/low-stock' }
    ]
  },
  {
    title: 'Marketing',
    icon: 'fas fa-bullhorn',
    children: [
      { title: 'Coupons', to: '/dashboard/coupons' },
      { title: 'Announcements', to: '/dashboard/announcements' }
    ]
  },
  { title: 'Reviews', icon: 'fas fa-star', to: '/dashboard/reviews' },
  { title: 'Shop Details', icon: 'fas fa-store', to: '/dashboard/shop' },
  { divider: true },
  { header: 'Social' },
  { title: 'Activity Feed', icon: 'fas fa-rss', to: '/connect/feeds' },
  { title: 'Spaces', icon: 'fas fa-users-rectangle', to: '/dashboard/spaces' },
  { title: 'Lists', icon: 'fas fa-list-check', to: '/lists' },
  { divider: true },
  { title: 'Integrations', icon: 'fas fa-plug', to: '/dashboard/integrations' },
  { title: 'Settings', icon: 'fas fa-gear', to: '/settings' }
]

function toItem(entry: DirectusNavEntry): WorkspaceMenu {
  const url = entry.url?.trim() || undefined
  return {
    title: entry.name?.trim() || url || 'Untitled',
    icon: entry.icon?.trim() || undefined,
    to: url,
    type: url && /^https?:\/\//i.test(url) ? 'external' : undefined,
    subCaption: entry.subtitle?.trim() || undefined,
    disabled: entry.active === 'Disabled',
  }
}

/** Directus navigation records -> the VerticalSidebar menu shape. */
export function navigationToWorkspaceMenu(records: DirectusNavigation[]): WorkspaceMenu[] {
  const sections = records
    .map((record) => {
      const submenus = record.submenus ?? []
      const items = (record.menus ?? [])
        .filter((entry) => entry?.name || entry?.url)
        .map((entry) => {
          const item = toItem(entry)
          const children = entry.value
            ? submenus.filter((sub) => sub?.value === entry.value && (sub.name || sub.url)).map(toItem)
            : []
          return children.length ? { ...item, to: undefined, type: undefined, children } : item
        })
      const heading = record.title?.trim() || record.name?.trim()
      return items.length ? [...(heading ? [{ header: heading }] : []), ...items] : []
    })
    .filter((section) => section.length)

  return sections.flatMap((section, i) => (i ? [{ divider: true }, ...section] : section))
}

export function useWorkspaceSidebar() {
  const ids = ((useAppConfig().uiShell as { workspaceSidebar?: Array<number | string> } | undefined)?.workspaceSidebar ?? [])
  const nuxtApp = useNuxtApp()

  const { data } = useAsyncData(`workspace:sidebar:${ids.join(',')}`, async () => {
    const directus = nuxtApp.$directus as { request?: (cmd: unknown) => Promise<unknown> } | undefined
    const readItems = nuxtApp.$readItems as ((collection: string, query: object) => unknown) | undefined
    if (!ids.length || !directus?.request || !readItems) return null
    try {
      const rows = await directus.request(readItems('navigation', {
        filter: { id: { _in: ids } },
        fields: ['id', 'name', 'title', 'menus', 'submenus'],
        limit: ids.length,
      })) as DirectusNavigation[]
      // keep the order the app listed the ids in
      const byId = new Map((rows ?? []).map((row) => [String(row.id), row]))
      const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean) as DirectusNavigation[]
      const menu = navigationToWorkspaceMenu(ordered)
      return menu.length ? menu : null
    } catch (error) {
      console.error('[ui-shell] workspace sidebar: Directus navigation failed, using the built-in menu', error)
      return null
    }
  })

  return computed<WorkspaceMenu[]>(() => data.value ?? WORKSPACE_FALLBACK_MENU)
}
