declare module '#imports' {
  export function useRuntimeConfig(): { public?: { searchUrl?: string } }
}

declare module '@searchkit/client' {
  export class SearchkitClient {
    constructor(config?: { url?: string; host?: string })
    query(...args: unknown[]): unknown
    fetch(...args: unknown[]): unknown
  }
  export type SearchkitClientConfig = { url?: string; host?: string }
}
