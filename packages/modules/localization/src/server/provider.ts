/**
 * Server-side translation provider helper.
 *
 * This module provides a small helper to call an external translation provider
 * if available. For `Local translation files only` mode this will not be used,
 * but keeping this helper allows users to wire a server proxy route that
 * delegates to a paid translation API later.
 */

export async function callProvider(url: string, text: string, from?: string, to?: string) {
  if (!url)
    throw new Error('No provider URL configured')

  const body = { text, from, to }
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })

  if (!res.ok)
    throw new Error(`Provider responded ${res.status}`)

  const data = await res.json()
  return data.translation || data.result || data
}

export default { callProvider }
