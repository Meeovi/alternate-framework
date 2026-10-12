// Shared types for @mframework/meeovi-tables (module options, server sources,
// API responses and the column schema the client turns into SVAR columns).

/** Who may read a collection through the tables API. */
export type MeeoviTableAccess = 'public' | 'authenticated'

/** Per-collection settings. Only collections listed here are readable. */
export interface MeeoviTableCollectionOptions {
  /** Display name for the table (defaults to the collection name). */
  label?: string
  /** 'authenticated' (default) requires a signed-in session. */
  access?: MeeoviTableAccess
  /** Also require one of these roles (better-auth `user.role`, comma-separated,
   *  e.g. ['admin', 'seller']). Implies access 'authenticated'. */
  roles?: string[]
  /** Only these fields are ever returned (recommended for anything sensitive). */
  fields?: string[]
  /** Force a source id ('directus', 'magento', ...); default 'auto'. */
  source?: string
  /** Default sort, e.g. 'name' or '-date_created'. */
  sort?: string
  /** Roles that may create / edit / delete rows (better-auth roles, e.g.
   *  ['admin']). Omitted = read-only. Writes go to the source the rows came
   *  from; sources without write support (e.g. commerce adapters) answer 405. */
  editRoles?: string[]
  /** false = only registered sources / installed adapter-* may serve this
   *  table — no Directus fallback (for commerce data that must come from the
   *  commerce backend). The table shows a notice until an adapter provides it. */
  fallback?: boolean
  /** Message shown while no source can serve this table (with `fallback: false`). */
  unavailableNotice?: string
  /** Source collection to read / write, when it differs from the table name
   *  (e.g. table `memories` over Directus `posts`). */
  collection?: string
  /** Per-user tables: the field holding the creator's user id (better-auth
   *  id). Signed-in users then see and create / edit / delete only their own
   *  rows — the server stamps it on create and never lets it be edited —
   *  without needing `editRoles`. */
  owner?: string
  /** Field stamped with the creator's display name on create (read-only),
   *  e.g. 'creator'. */
  ownerName?: string
  /** Roles that see and manage every row of an `owner` table. Default ['admin']. */
  ownerBypassRoles?: string[]
  /** Fixed Directus filter applied to every read, e.g.
   *  `{ date_created: { _lt: '$NOW' } }`. */
  filter?: Record<string, unknown>
  /** Fields shown but never editable here (e.g. view counters). */
  readonlyFields?: string[]
  /** Values set on every new row (e.g. NOT NULL fields the form doesn't show). */
  defaults?: Record<string, unknown>
}

export interface MeeoviTablesModuleOptions {
  /** API route prefix. Default '/api/tables'. */
  apiBase?: string
  /** Readable collections and their settings. Anything else is a 404. */
  collections?: Record<string, MeeoviTableCollectionOptions>
  /** Default rows per page. */
  pageSize?: number
  /** Upper bound for ?pageSize. */
  maxPageSize?: number
  /** Endpoint used to check `access: 'authenticated'` (better-auth by default). */
  sessionEndpoint?: string
  /** Directus — the fallback data source and the schema source. Server-only. */
  directus?: {
    url?: string
    token?: string
  }
}

/** Normalized column description (derived from Directus field metadata). */
export interface MeeoviTableField {
  field: string
  label: string
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'uuid' | 'unknown'
  /** Select-style fields: the allowed values. */
  choices?: Array<{ id: string | number, label: string }>
  /** Directus hides it in its own UI — start hidden here too. */
  hidden?: boolean
  /** Directus "half" width fields get a narrower default column. */
  narrow?: boolean
  sortable?: boolean
  /** Not editable (primary keys, system timestamps, Directus read-only). */
  readonly?: boolean
  required?: boolean
  primary?: boolean
}

export interface MeeoviTableQuery {
  collection: string
  page: number
  pageSize: number
  /** 'field' (asc) or '-field' (desc) */
  sort?: string
  search?: string
  /** Restrict returned fields (already intersected with the allowlist). */
  fields?: string[]
  /** Directus-style filter object. Only passed to sources with `filters: true`. */
  filter?: Record<string, unknown>
}

export interface MeeoviTableResult {
  rows: Record<string, unknown>[]
  total: number
}

/**
 * A data source the tables API can read from. Installed adapter-* packages
 * are wrapped automatically (via alternate-sdk's CommerceBackendRegistry);
 * Directus is the built-in fallback. Register more with registerTableSource().
 */
export interface MeeoviTableSource {
  id: string
  label: string
  /** Can this source serve the collection right now? */
  handles(collection: string): boolean | Promise<boolean>
  /** Applies `query.filter` (Directus filter syntax). Tables with an `owner`
   *  or `filter` are only served by such sources, so rows are never leaked
   *  by a source that would ignore the filter. */
  filters?: boolean
  list(query: MeeoviTableQuery): Promise<MeeoviTableResult>
  /** Column schema for the collection, when the source knows it. */
  schema?(collection: string): Promise<MeeoviTableField[] | null>
  /** Write support — omit for read-only sources. */
  create?(collection: string, data: Record<string, unknown>): Promise<Record<string, unknown>>
  update?(collection: string, id: string | number, data: Record<string, unknown>): Promise<Record<string, unknown>>
  remove?(collection: string, id: string | number): Promise<void>
}

/** GET {apiBase}/:collection response. */
export interface MeeoviTableResponse {
  collection: string
  label: string
  /** Source that served the rows. */
  source: string
  /** Every source that can serve this collection (for a source switcher). */
  sources: Array<{ id: string, label: string }>
  /** Where the column schema came from ('directus' or 'rows'). */
  schemaSource: 'directus' | 'rows'
  schema: MeeoviTableField[]
  rows: Record<string, unknown>[]
  total: number
  page: number
  pageSize: number
  sort: string | null
  search: string | null
  /** The signed-in user may create / edit / delete here (editRoles + a
   *  source with write support). */
  canEdit: boolean
  /** Primary key field ('id' by default). */
  primaryKey: string
  /** Shown instead of rows when no source can serve the table yet. */
  notice?: string
}

/** GET {apiBase} response. */
export interface MeeoviTablesIndexResponse {
  collections: Array<{ collection: string, label: string, access: MeeoviTableAccess, sources: string[] }>
}

export interface MeeoviTablesPublicConfig {
  apiBase: string
  pageSize: number
}
