import type { MagentoRuntimeConfig } from '../magentoClient'

interface RestOptions {
  method?: string
  params?: Record<string, any>
  body?: any
  customerToken?: string
}

export async function magentoRest(
  config: MagentoRuntimeConfig & { customerToken?: string },
  path: string,
  options: RestOptions = {}
) {
  const url = new URL(config.url.replace(/\/$/, '') + path)

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (config.adminToken) {
    headers['Authorization'] = `Bearer ${config.adminToken}`
  }
  if (config.customerToken || options.customerToken) {
    headers['Authorization'] = `Bearer ${options.customerToken || config.customerToken}`
  }

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Magento REST error ${res.status}: ${text}`)
  }

  if (res.status === 204) return null
  return res.json()
}
