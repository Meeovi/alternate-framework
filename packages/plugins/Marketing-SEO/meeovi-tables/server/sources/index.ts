import type { MeeoviTableSource } from '../../runtime/types'
import { adapterSources } from './adapters'
import { directusSource } from './directus'

/**
 * Table sources, in priority order: sources registered with
 * registerTableSource(), then installed adapter-* packages (looked up live,
 * so adapters registered by Nitro plugins after this module loaded are seen),
 * then Directus as the fallback.
 */
const customSources = new Map<string, MeeoviTableSource>()

/** Add (or replace) a source, e.g. from an app's Nitro plugin. */
export function registerTableSource(source: MeeoviTableSource): void {
  customSources.set(source.id, source)
}

export function allSources(): MeeoviTableSource[] {
  const seen = new Set<string>()
  return [...customSources.values(), ...adapterSources(), directusSource].filter((source) => {
    if (seen.has(source.id)) return false
    seen.add(source.id)
    return true
  })
}

/** Sources that can serve `collection` right now, in priority order. */
export async function sourcesFor(collection: string): Promise<MeeoviTableSource[]> {
  const result: MeeoviTableSource[] = []
  for (const source of allSources()) {
    try {
      if (await source.handles(collection)) result.push(source)
    } catch {
      // a broken source shouldn't take the table down — skip it
    }
  }
  return result
}

export { directusSource } from './directus'
export { queryRows } from './adapters'
export type { MeeoviTableSource } from '../../runtime/types'
