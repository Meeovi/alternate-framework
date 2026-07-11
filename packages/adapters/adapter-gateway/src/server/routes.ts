import type { APISource } from '../../types'

const loadSourcesFromEnv = (prefix = 'MESH_SOURCE_'): APISource[] => {
  const sources: APISource[] = []

  if (typeof process === 'undefined' || !process.env) {
    return sources
  }

  const env = process.env
  const sourceNames = new Set<string>()

  for (const key of Object.keys(env)) {
    const match = key.match(new RegExp(`^${prefix}([A-Z]+)_ENDPOINT$`))
    if (match) {
      sourceNames.add(match[1].toLowerCase())
    }
  }

  for (const sourceName of sourceNames) {
    const endpoint = env[`${prefix}${sourceName.toUpperCase()}_ENDPOINT`]
    const type = env[`${prefix}${sourceName.toUpperCase()}_TYPE`] || 'rest'
    const headersRaw = env[`${prefix}${sourceName.toUpperCase()}_HEADERS`]

    if (endpoint) {
      const source: APISource = {
        name: sourceName,
        type,
        endpoint,
        headers: headersRaw ? JSON.parse(headersRaw) : undefined
      }
      sources.push(source)
    }
  }

  return sources
}

export const getGatewaySources = (): APISource[] => {
  return loadSourcesFromEnv()
}

export const resolveGatewaySource = (sourceName: string): APISource | undefined => {
  const sources = getGatewaySources()
  return sources.find((s) => s.name === sourceName || s.type === sourceName)
}
