/**
 * Frontend search composable.
 *
 * Previously this composable imported `SearchAdapterRegistry` from
 * `alternate-sdk` and accessed `globalThis.useGateway` directly — both are
 * server-side concepts that should not be imported by browser code.
 *
 * This version delegates all search operations to the server-side endpoint
 * `POST /api/gateway/search`, which resolves the default search adapter on
 * the server and forwards the call. The frontend only depends on HTTP +
 * the `SearchAdapter` method contract, making it backend-agnostic.
 */

type AnyRecord = Record<string, any>

const callSearchDriver = (method: string, ...args: unknown[]): Promise<any> => {
  if (!method) return Promise.resolve(undefined)

  return $fetch('/api/gateway/search', {
    method: 'POST',
    body: { method, args: args.length > 0 ? args : undefined },
  }).catch(() => undefined)
}

export function useSearch() {
  return {
    search: (query: string, options?: AnyRecord): Promise<any[]> =>
      callSearchDriver('search', query, options).then((result) => result ?? []),

    suggest: (query: string): Promise<string[]> =>
      callSearchDriver('suggest', query).then((result) => result ?? []),

    index: (doc: AnyRecord): Promise<void> =>
      callSearchDriver('index', doc).then(() => {}),

    stats: (): Promise<any> =>
      callSearchDriver('stats').then((result) => result ?? null),

    clear: (): Promise<void> =>
      callSearchDriver('clear').then(() => {}),

    getAdapter: (): any => ({}),
  }
}

export default useSearch
