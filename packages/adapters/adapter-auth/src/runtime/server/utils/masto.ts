import { prisma } from '@mframework/core'

export function getMastoConfig() {
  // App-level defaults - override via env
  return {
    baseUrl: process.env.MASTO_BASE_URL || process.env.SOCIAL_BASE_URL || '',
    apiKey: process.env.MASTO_API_KEY || process.env.SOCIAL_API_KEY || ''
  }
}

export async function proxyMastodonRequest(path, method = 'GET', headers = {}, body = undefined) {
  const { baseUrl, apiKey } = getMastoConfig()
  if (!baseUrl) throw new Error('Mastodon base URL not configured')

  const url = `${baseUrl.replace(/\/$/, '')}${path}`
  const fetchHeaders = {
    'content-type': 'application/json',
    ...headers
  }
  if (apiKey) fetchHeaders['authorization'] = `Bearer ${apiKey}`

  const res = await fetch(url, {
    method,
    headers: fetchHeaders,
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  })

  const text = await res.text()
  let data = text
  try { data = JSON.parse(text) } catch (e) { /* not JSON */ }
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), data }
}

export async function createMastoClientForUser(userId) {
  // Try to read stored access token from prisma (if available)
  try {
    const user = await prisma.users.findUnique({ where: { id: userId } })
    const token = (user && user.mastodonAccessToken) || (user && user.socialTokens?.mastodon)
    const instance = (user && user.mastodonInstance) || undefined
    if (!token) return null
    const { createRestAPIClient, createStreamingAPIClient } = await import('masto')
    const url = instance ? `https://${instance}` : (getMastoConfig().baseUrl || undefined)
    const client = createRestAPIClient({ url, accessToken: token })
    const streamingClient = (client && client.v2 && client.v2.instance && client.v2.instance.configuration && client.v2.instance.configuration.urls && client.v2.instance.configuration.urls.streaming)
      ? createStreamingAPIClient({ streamingApiUrl: client.v2.instance.configuration.urls.streaming, accessToken: token, implementation: globalThis.WebSocket })
      : undefined
    return { client, streamingClient }
  } catch (e) {
    return null
  }
}

// Do not export a default object to avoid creating a conflicting global
// auto-import named `masto`. Consumers should import the functions by name:
// `import { getMastoConfig, proxyMastodonRequest, createMastoClientForUser } from '#auth/server/utils/masto'`
