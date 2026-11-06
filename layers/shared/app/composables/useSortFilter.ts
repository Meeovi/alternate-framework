import { computed, watch, type ComputedRef } from 'vue'
import { useRoute, useRouter, useState } from '#imports'

/**
 * Sorting, searching and filtering for a list a page has already loaded.
 * Use it with <SortFilterBar> (#shared/app/components/SortFilterBar.vue).
 *
 * The choices live in the page address (?sort=price-asc&q=frog&price=free),
 * so a reload or a shared link shows the same thing, and the server renders
 * the page already sorted and filtered. Components on one page that use the
 * same `id` share one set of choices (e.g. the space tabs under one bar).
 * Two bars on one page need different ids and a `prefix` for one of them,
 * which goes before its address keys (`notes-sort`, `notes-q`).
 */

export interface SortOption<T> {
  value: string
  title: string
  compare: (a: T, b: T) => number
}

export interface FilterChoice {
  value: string
  title: string
}

export interface FilterDef<T> {
  key: string
  title: string
  /** The choices, or a function returning them (e.g. from the loaded items). */
  options: FilterChoice[] | (() => FilterChoice[])
  /** Several choices at once (any of them matches). */
  multiple?: boolean
  match: (item: T, value: string) => boolean
}

export interface SortFilterConfig<T> {
  id: string
  /** Put before this bar's address keys, when a page has two bars. */
  prefix?: string
  sorts: SortOption<T>[]
  /** The sort when the address names none: the first one by default. */
  defaultSort?: string
  filters?: FilterDef<T>[]
  /** The text a search matches against. Leave out to have no search box. */
  search?: (item: T) => unknown
}

interface State {
  sort: string
  q: string
  filters: Record<string, string[]>
}

export interface SortFilter<T> {
  config: SortFilterConfig<T>
  sort: ComputedRef<string>
  q: ComputedRef<string>
  filters: ComputedRef<Record<string, string[]>>
  setSort: (value: string) => void
  setSearch: (value: string) => void
  setFilter: (key: string, values: string[]) => void
  reset: () => void
  /** Any search or filter chosen (the sort doesn't count). */
  active: ComputedRef<boolean>
  /** The items searched, filtered and sorted. */
  apply: (items: T[] | null | undefined) => T[]
}

const first = (value: unknown) => (Array.isArray(value) ? value[0] : value)

export function useSortFilter<T>(config: SortFilterConfig<T>): SortFilter<T> {
  const route = useRoute()
  const router = useRouter()
  const prefix = config.prefix ? `${config.prefix}-` : ''
  const defaultSort = config.defaultSort ?? config.sorts[0]?.value ?? ''
  const filterKeys = (config.filters ?? []).map((f) => f.key)

  const fromQuery = (): State => {
    const sort = String(first(route.query[`${prefix}sort`]) ?? '')
    const filters: Record<string, string[]> = {}
    for (const key of filterKeys) {
      const raw = first(route.query[`${prefix}${key}`])
      filters[key] = raw ? String(raw).split(',').filter(Boolean) : []
    }
    return {
      sort: config.sorts.some((s) => s.value === sort) ? sort : defaultSort,
      q: String(first(route.query[`${prefix}q`]) ?? '').slice(0, 100),
      filters,
    }
  }

  // Shared by every component on the page with this id, and handed from the
  // server render to the browser like any other useState.
  const state = useState<State & { path: string }>(`sort-filter:${config.id}`, () => ({ ...fromQuery(), path: route.path }))
  // Another page (e.g. the next department): start from its own address.
  if (state.value.path !== route.path) state.value = { ...fromQuery(), path: route.path }
  watch(() => route.path, (path) => {
    if (path !== state.value.path) state.value = { ...fromQuery(), path }
  })

  // The address follows the choices (replace, so Back leaves the page
  // instead of stepping through every change). Typing waits a moment.
  let timer: ReturnType<typeof setTimeout> | undefined
  const writeQuery = (delay = 0) => {
    if (import.meta.server) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      const query: Record<string, any> = { ...route.query }
      const set = (key: string, value: string) => {
        if (value) query[`${prefix}${key}`] = value
        else delete query[`${prefix}${key}`]
      }
      set('sort', state.value.sort === defaultSort ? '' : state.value.sort)
      set('q', state.value.q.trim())
      for (const key of filterKeys) set(key, (state.value.filters[key] ?? []).join(','))
      router.replace({ query }).catch(() => {})
    }, delay)
  }

  const setSort = (value: string) => {
    state.value.sort = value || defaultSort
    writeQuery()
  }
  const setSearch = (value: string) => {
    state.value.q = String(value ?? '').slice(0, 100)
    writeQuery(400)
  }
  const setFilter = (key: string, values: string[]) => {
    state.value.filters = { ...state.value.filters, [key]: (values ?? []).filter(Boolean) }
    writeQuery()
  }
  const reset = () => {
    state.value = { sort: defaultSort, q: '', filters: {}, path: route.path }
    writeQuery()
  }

  const active = computed(() => !!state.value.q.trim()
    || Object.values(state.value.filters).some((values) => values?.length))

  const apply = (items: T[] | null | undefined): T[] => {
    let list = (items ?? []).filter((item) => item != null)
    const words = state.value.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length && config.search) {
      list = list.filter((item) => {
        const text = String(config.search!(item) ?? '').toLowerCase()
        return words.every((word) => text.includes(word))
      })
    }
    for (const filter of config.filters ?? []) {
      const chosen = state.value.filters[filter.key] ?? []
      if (chosen.length) list = list.filter((item) => chosen.some((value) => filter.match(item, value)))
    }
    const sort = config.sorts.find((s) => s.value === state.value.sort) ?? config.sorts[0]
    // Ties keep the order the page loaded them in.
    return sort ? list.map((item, i) => [item, i] as const)
      .sort((a, b) => sort.compare(a[0], b[0]) || a[1] - b[1])
      .map(([item]) => item) : list
  }

  return {
    config,
    sort: computed(() => state.value.sort),
    q: computed(() => state.value.q),
    filters: computed(() => state.value.filters),
    setSort,
    setSearch,
    setFilter,
    reset,
    active,
    apply,
  }
}

// ---- comparison helpers ---------------------------------------------------

const time = (value: unknown) => {
  const t = value ? new Date(value as any).getTime() : NaN
  return Number.isFinite(t) ? t : null
}

/** Newest (or oldest) first by the first date the item has; undated last. */
export const byDate = <T>(get: (item: T) => unknown, newestFirst = true) => (a: T, b: T) => {
  const ta = time(get(a))
  const tb = time(get(b))
  if (ta === null || tb === null) return ta === tb ? 0 : ta === null ? 1 : -1
  return newestFirst ? tb - ta : ta - tb
}

/** Numbers, smallest first (or largest); missing values last. */
export const byNumber = <T>(get: (item: T) => unknown, largestFirst = false) => (a: T, b: T) => {
  const na = Number(get(a))
  const nb = Number(get(b))
  const okA = get(a) !== null && get(a) !== undefined && get(a) !== '' && Number.isFinite(na)
  const okB = get(b) !== null && get(b) !== undefined && get(b) !== '' && Number.isFinite(nb)
  if (!okA || !okB) return okA === okB ? 0 : okA ? -1 : 1
  return largestFirst ? nb - na : na - nb
}

/** Text A–Z (or Z–A), ignoring case and accents; empty last. */
export const byText = <T>(get: (item: T) => unknown, descending = false) => (a: T, b: T) => {
  const sa = String(get(a) ?? '').trim()
  const sb = String(get(b) ?? '').trim()
  if (!sa || !sb) return sa === sb ? 0 : sa ? -1 : 1
  const order = sa.localeCompare(sb, undefined, { sensitivity: 'base', numeric: true })
  return descending ? -order : order
}

/** Distinct values from the items, as filter choices sorted by name. */
export const choicesFrom = <T>(items: T[] | null | undefined, get: (item: T) => unknown): FilterChoice[] => {
  const seen = new Map<string, string>()
  for (const item of items ?? []) {
    const raw = get(item)
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      const text = String(value ?? '').trim()
      if (text && !seen.has(text.toLowerCase())) seen.set(text.toLowerCase(), text)
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, title: value }))
}
