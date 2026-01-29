declare module '@atproto/api' {
  export class AtpAgent {
    constructor(opts?: any)
    login?: (...args: any[]) => any
    // fallback any for other members
    [key: string]: any
  }
  export default AtpAgent
}

declare global {
  function useRuntimeConfig(): any
  function useNuxtApp(): any
  function onNuxtReady(cb: () => void): void
}

declare module '#imports' {
  export function useRuntimeConfig(): any
  export function useNuxtApp(): any
  export function onNuxtReady(cb: () => void): void
}
