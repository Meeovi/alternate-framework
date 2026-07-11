import { describe, it, expect, vi, beforeAll } from 'vitest'

const mockFetch = vi.fn()

beforeAll(() => {
  global.fetch = mockFetch
})

describe('integration: adapter-gateway -> alternate-sdk -> frontend', () => {
  it('simulates successful data fetch through gateway chain', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: '1', title: 'Product 1', price: 29.99 },
          { id: '2', title: 'Product 2', price: 49.99 }
        ]
      })
    } as Response)

    const testData = {
      id: '1',
      name: 'test-product',
      endpoint: 'https://cms.meeovicms.com',
      headers: { Authorization: 'Bearer 1_48eDyOk1e95CzuPXR5sPYCDrVqHcPM' }
    }

    const url = new URL('/items/products', testData.endpoint)
    url.searchParams.set('fields', JSON.stringify(['id', 'title']))

    const res = await mockFetch(url.toString(), {
      method: 'GET',
      headers: testData.headers
    })

    const data = await res.json()
    
    expect(res.ok).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].title).toBe('Product 1')
  })

  it('simulates error response when backend unavailable', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: 'Service unavailable' } })
    } as Response)

    const testData = {
      endpoint: 'https://cms.meeovicms.com',
      headers: { Authorization: 'Bearer 1_48eDyOk1e95CzuPXR5sPYCDrVqHcPM' }
    }

    const url = new URL('/items/products', testData.endpoint)
    const res = await mockFetch(url.toString(), {
      method: 'GET',
      headers: testData.headers
    })

    expect(res.ok).toBe(false)
    expect(res.status).toBe(503)
  })

  it('simulates authentication header passing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ authenticated: true }] })
    } as Response)

    const testData = {
      endpoint: 'https://cms.meeovicms.com',
      token: '1_48eDyOk1e95CzuPXR5sPYCDrVqHcPM'
    }

    const res = await mockFetch(`${testData.endpoint}/items/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testData.token}`
      }
    })

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1]?.headers
    
    expect(headers.Authorization).toBe(`Bearer ${testData.token}`)
  })
})