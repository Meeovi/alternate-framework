import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createMauticClient } from '../src/runtime/client'

describe('createMauticClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the contacts list url with query params', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ contacts: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))

    const client = createMauticClient({ apiBaseUrl: 'https://mautic.example.com', apiPath: '/api' })
    await client.contacts.list({ search: 'maria', limit: 10 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toBe('https://mautic.example.com/api/contacts?search=maria&limit=10')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'GET' })
  })

  it('sends json bodies when creating a form', async () => {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 1 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }))

    const client = createMauticClient({ apiBaseUrl: 'https://mautic.example.com', apiPath: '/api' })
    await client.forms.create({ name: 'Newsletter signup' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toBe('https://mautic.example.com/api/forms')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ name: 'Newsletter signup' }),
    })
  })
})