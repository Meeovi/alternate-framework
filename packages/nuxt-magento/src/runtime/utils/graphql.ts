import type { MagentoRuntimeConfig } from '../magentoClient'

export async function magentoGraphQL(config: MagentoRuntimeConfig, query: string, variables?: Record<string, any>) {
  const url = config.url.replace(/\/$/, '') + '/graphql'
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  const token = (config as any).customerToken || config.adminToken
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GraphQL request failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  if (json.errors && json.errors.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
  }

  return json.data
}
