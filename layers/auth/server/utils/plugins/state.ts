/**
 * Storage for auth plugins: each plugin's site-wide on/off switch and
 * settings, and sandboxed plugins' own key-value data — the `auth_plugins`
 * schema (migration 20261020090000_auth_plugins_schema; keep in step).
 */
import { and, asc, count, eq, like } from 'drizzle-orm'
import { boolean, jsonb, pgSchema, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import type { PgAsyncDatabase } from 'drizzle-orm/pg-core'

const schema = pgSchema('auth_plugins')
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

export const pluginStates = schema.table('plugins', {
  package: text().primaryKey(),
  enabled: boolean().notNull(),
  settings: jsonb().notNull().default({}),
  updatedBy: text('updated_by'),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})

export const pluginKv = schema.table('kv', {
  package: text().notNull(),
  key: text().notNull(),
  value: jsonb().notNull(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.package, t.key] })])

export interface PluginStateRow {
  package: string
  enabled: boolean
  settings: Record<string, unknown>
  updatedBy: string | null
  updatedAt: Date
}

/** Limits on a sandboxed plugin's own data. */
export const KV_MAX_KEYS = 1000
export const KV_MAX_VALUE_BYTES = 16 * 1024
export const KV_KEY_RE = /^[\w.:/-]{1,200}$/

export interface PluginStateStore {
  states(): Promise<PluginStateRow[]>
  saveState(pkg: string, patch: { enabled?: boolean, settings?: Record<string, unknown> }, defaults: { enabled: boolean }, by: string | null): Promise<void>
  kvGet(pkg: string, key: string): Promise<unknown>
  kvSet(pkg: string, key: string, value: unknown): Promise<void>
  kvDelete(pkg: string, key: string): Promise<void>
  kvList(pkg: string, prefix: string): Promise<string[]>
}

export function checkKv(key: string, value?: unknown) {
  if (!KV_KEY_RE.test(key)) throw new Error('Store keys are 1-200 letters, digits or . : / _ -')
  if (value !== undefined) {
    if (value === null) throw new Error('Store values can\'t be null (use delete)')
    if (Buffer.byteLength(JSON.stringify(value)) > KV_MAX_VALUE_BYTES) throw new Error(`Store values are limited to ${KV_MAX_VALUE_BYTES} bytes`)
  }
}

const likePrefix = (prefix: string) => `${prefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

export class PostgresPluginStateStore implements PluginStateStore {
  constructor(private readonly db: PgAsyncDatabase<any, any>) {}

  async states() {
    const rows = await this.db.select().from(pluginStates)
    return rows.map((r) => ({ ...r, settings: (r.settings ?? {}) as Record<string, unknown> }))
  }

  async saveState(pkg: string, patch: { enabled?: boolean, settings?: Record<string, unknown> }, defaults: { enabled: boolean }, by: string | null) {
    const set = { ...patch, updatedBy: by, updatedAt: new Date() }
    await this.db.insert(pluginStates)
      .values({ package: pkg, enabled: patch.enabled ?? defaults.enabled, settings: patch.settings ?? {}, updatedBy: by })
      .onConflictDoUpdate({ target: pluginStates.package, set })
  }

  async kvGet(pkg: string, key: string) {
    checkKv(key)
    const [row] = await this.db.select({ value: pluginKv.value }).from(pluginKv).where(and(eq(pluginKv.package, pkg), eq(pluginKv.key, key))).limit(1)
    return row?.value ?? null
  }

  async kvSet(pkg: string, key: string, value: unknown) {
    checkKv(key, value)
    const [existing] = await this.db.select({ key: pluginKv.key }).from(pluginKv).where(and(eq(pluginKv.package, pkg), eq(pluginKv.key, key))).limit(1)
    if (!existing) {
      const [row] = await this.db.select({ n: count() }).from(pluginKv).where(eq(pluginKv.package, pkg))
      if (Number(row?.n ?? 0) >= KV_MAX_KEYS) throw new Error(`Store is full (${KV_MAX_KEYS} keys)`)
    }
    await this.db.insert(pluginKv).values({ package: pkg, key, value })
      .onConflictDoUpdate({ target: [pluginKv.package, pluginKv.key], set: { value, updatedAt: new Date() } })
  }

  async kvDelete(pkg: string, key: string) {
    checkKv(key)
    await this.db.delete(pluginKv).where(and(eq(pluginKv.package, pkg), eq(pluginKv.key, key)))
  }

  async kvList(pkg: string, prefix: string) {
    const rows = await this.db.select({ key: pluginKv.key }).from(pluginKv)
      .where(and(eq(pluginKv.package, pkg), like(pluginKv.key, likePrefix(prefix))))
      .orderBy(asc(pluginKv.key)).limit(KV_MAX_KEYS)
    return rows.map((r) => r.key)
  }
}

/** In-memory store (tests). */
export class MemoryPluginStateStore implements PluginStateStore {
  readonly rows = new Map<string, PluginStateRow>()
  readonly kv = new Map<string, Map<string, unknown>>()

  async states() { return [...this.rows.values()].map((r) => structuredClone(r)) }
  async saveState(pkg: string, patch: { enabled?: boolean, settings?: Record<string, unknown> }, defaults: { enabled: boolean }, by: string | null) {
    const prev = this.rows.get(pkg)
    this.rows.set(pkg, {
      package: pkg,
      enabled: patch.enabled ?? prev?.enabled ?? defaults.enabled,
      settings: patch.settings ?? prev?.settings ?? {},
      updatedBy: by,
      updatedAt: new Date(),
    })
  }

  private bucket(pkg: string) {
    let b = this.kv.get(pkg)
    if (!b) this.kv.set(pkg, (b = new Map()))
    return b
  }

  async kvGet(pkg: string, key: string) { checkKv(key); return structuredClone(this.bucket(pkg).get(key) ?? null) }
  async kvSet(pkg: string, key: string, value: unknown) {
    checkKv(key, value)
    const b = this.bucket(pkg)
    if (!b.has(key) && b.size >= KV_MAX_KEYS) throw new Error(`Store is full (${KV_MAX_KEYS} keys)`)
    b.set(key, structuredClone(value))
  }

  async kvDelete(pkg: string, key: string) { checkKv(key); this.bucket(pkg).delete(key) }
  async kvList(pkg: string, prefix: string) { return [...this.bucket(pkg).keys()].filter((k) => k.startsWith(prefix)).sort() }
}
