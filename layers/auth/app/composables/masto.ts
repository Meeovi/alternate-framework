
function makeProxyClient(defaultToken?: string) {
  const tokenHeader = (token?: string) => ({ Authorization: token ? `Bearer ${token}` : '' })

  return {
    value: {
      v1: {
        accounts: {
          async verifyCredentials(token?: string) {
            const res = await fetch(`/api/masto/api/v1/accounts/verify_credentials`, { headers: { ...tokenHeader(token ?? defaultToken) } })
            if (!res.ok) throw new Error('Failed to verify credentials')
            return res.json()
          }
        },
        push: {
          subscription: {
            async fetch(token?: string) {
              const res = await fetch(`/api/masto/api/v1/push/subscription`, { headers: { ...tokenHeader(token ?? defaultToken) } })
              if (!res.ok) return undefined
              return res.json()
            }
          }
        },
      },
      v2: {
        search: {
          list(opts: any) {
            const params = new URLSearchParams(opts || {})
            return {
              async *values() {
                const res = await fetch(`/api/masto/api/v2/search?${params.toString()}`)
                const body = await res.json()
                yield { value: { accounts: body.accounts ?? [], statuses: body.statuses ?? [] } }
              }
            }
          }
        }
      }
    }
  } as any
}

export function useMasto(defaultToken?: string) {
  // Try to create a native `masto` client dynamically when available,
  // otherwise fall back to the server-side proxy implementation above.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const maybe = require('masto')
    if (maybe && typeof maybe.createClient === 'function') {
      const client = maybe.createClient as any
      // Return a small wrapper that matches the shape used by callers.
      return { client: { value: client } } as any
    }
  } catch (e) {
    // dynamic import failed — fallback to proxy
  }

  return makeProxyClient(defaultToken)
}

export default useMasto
