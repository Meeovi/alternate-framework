export interface ApiPluginContext {
  registerFetcher: (name: string, fetcher: any) => void
  setActiveFetcher: (name: string) => void
  // you can add more hooks later (registerRestEndpoint, etc.)
}
