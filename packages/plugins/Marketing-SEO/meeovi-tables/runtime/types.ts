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
  list(query: MeeoviTableQuery): Promise<MeeoviTableResult>
  /** Column schema for the collection, when the source knows it. */
  schema?(collection: string): Promise<MeeoviTableField[] | null>
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
}

/** GET {apiBase} response. */
export interface MeeoviTablesIndexResponse {
  collections: Array<{ collection: string, label: string, access: MeeoviTableAccess, sources: string[] }>
}

export interface MeeoviTablesPublicConfig {
  apiBase: string
  pageSize: number
}
