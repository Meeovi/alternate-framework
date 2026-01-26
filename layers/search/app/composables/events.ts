declare module '@meeovi/core/dist/types/events' {
  interface AlternateEventMap {
    'search:query': { term: string }
    'search:results': { term: string; total: number }
  }
}