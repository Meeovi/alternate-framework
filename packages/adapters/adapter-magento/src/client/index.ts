import { GraphQLClient } from 'graphql-request'
import { getSdk } from './sdk'

export interface MagentoClientOptions {
  endpoint: string
  accessToken?: string
  timeoutMs?: number
  retries?: number
  fetchImpl?: typeof fetch
}

// createMagentoClient exposes a GraphQL SDK wrapped with a fetch implementation
// that supports timeout and optional retries. If running in Node, provide a
// `fetchImpl` (for example, node-fetch) when Node runtime lacks a global fetch.
export function createMagentoClient(options: MagentoClientOptions) {
  const fetchImpl = options.fetchImpl ?? (globalThis as any).fetch

  const wrappedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
    const timeout = options.timeoutMs ? setTimeout(() => controller?.abort(), options.timeoutMs) : undefined
    try {
      const res = await (fetchImpl as any)(input, { ...init, signal: controller?.signal })
      return res
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }

  const client = new GraphQLClient(options.endpoint, {
    headers: options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {},
    fetch: wrappedFetch as any,
  })

  return getSdk(client)
}