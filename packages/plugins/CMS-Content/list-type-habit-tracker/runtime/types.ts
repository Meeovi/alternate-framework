/**
 * Contract shared by every `@mframework/list-type-*` plugin.
 *
 * Each plugin registers one or more entries under `appConfig.listTypes`,
 * keyed by the Directus `list_types.name` it renders (e.g. "Kanban"). The
 * list page (layers/social/app/pages/lists/list/[...slug].vue) looks the
 * list's type up there and renders `<component :is="entry.component">` —
 * or, for a sandboxed entry, the plugin's sandboxed UI in an
 * <IntegrationFrame> (@mframework/meeovi-integrations) — so a list type is
 * enabled simply by registering its plugin in an app's `nuxt.config.ts`.
 */
export interface ListTypeRegistration {
  /** Globally registered component name that renders the list (in-app types). */
  component?: string
  /** Rendered by the plugin's sandboxed UI instead of an in-app component. */
  sandbox?: boolean
  /** What the list page lends a sandboxed type, all scoped to the list on
   *  screen: 'list.items' (read), 'list.create', 'list.update', 'list.remove'.
   *  Default: read only. */
  capabilities?: string[]
  /** Human-readable label, for pickers / menus. */
  label: string
  /** Icon class (Font Awesome / MDI). */
  icon?: string
  /** Render this entry for list types that no plugin claims. */
  fallback?: boolean
  /** Package that registered the entry, for debugging collisions. */
  plugin: string
}

/** Props every list-type component receives from the list page. */
export interface ListTypeComponentProps {
  listId: string | number
  items?: unknown[]
  readonly?: boolean
}

export interface ListTypeModuleOptions {
  /**
   * Directus `list_types.name` values this plugin renders. Override to
   * match your own list type names.
   */
  types?: string[]
  /** Directus collection holding the list's items. */
  collection?: string
}
