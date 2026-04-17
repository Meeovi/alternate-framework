import { createError } from 'h3'

function appendParam(searchParams: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => appendParam(searchParams, `${key}[${index}]`, entry))
    return
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      appendParam(searchParams, `${key}[${childKey}]`, childValue)
    })
    return
  }

  searchParams.append(key, String(value))
}

export function getListsContentConfig(event: any) {
  const config = useRuntimeConfig(event) as any
  const url =
    config.listsContentApi?.url
    || process.env.LISTS_CONTENT_API_URL
    || process.env.LISTS_API_URL
    || process.env.DIRECTUS_URL

  if (!url) {
    throw createError({ statusCode: 500, statusMessage: 'Lists content API is not configured' })
  }

  const apiToken =
    config.listsContentApi?.apiToken
    || process.env.LISTS_CONTENT_API_TOKEN
    || process.env.LISTS_API_TOKEN
    || process.env.DIRECTUS_API_TOKEN

  return {
    url: String(url).replace(/\/$/, ''),
    apiToken: apiToken ? String(apiToken) : '',
  }
}

export function buildDirectusUrl(baseUrl: string, path: string, opts?: Record<string, unknown>) {
  const searchParams = new URLSearchParams()

  if (opts) {
    Object.entries(opts).forEach(([key, value]) => appendParam(searchParams, key, value))
  }

  const query = searchParams.toString()
  return query ? `${baseUrl}${path}?${query}` : `${baseUrl}${path}`
}