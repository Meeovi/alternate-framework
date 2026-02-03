export class MagentoService {
  baseUrl: string
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.MAGENTO_API_URL as string) || ''
  }

  private headers(token?: string) {
    const h: Record<string,string> = { 'Content-Type': 'application/json' }
    if (token) h['Authorization'] = `Bearer ${token}`
    return h
  }

  async fetchJSON(path: string, opts: RequestInit = {}, token?: string) {
    const url = path.startsWith('http') ? path : `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    const res = await fetch(url, { ...opts, headers: { ...(opts.headers as any || {}), ...this.headers(token) } })
    if (!res.ok) {
      const text = await res.text().catch(()=>'')
      const err = new Error(`Magento API error ${res.status}: ${text}`)
      throw err
    }
    return res.json()
  }

  async getProduct(sku: string) {
    return this.fetchJSON(`/products/${encodeURIComponent(sku)}`)
  }

  async createGuestCart() {
    return this.fetchJSON('/guest-carts', { method: 'POST' })
  }

  async createCustomerCart(token: string) {
    return this.fetchJSON('/carts/mine', { method: 'POST' }, token)
  }

  async addItemToCart(token: string, item: any) {
    return this.fetchJSON('/carts/mine/items', { method: 'POST', body: JSON.stringify({ cartItem: item }) }, token)
  }

  async getCartTotals(token: string) {
    return this.fetchJSON('/carts/mine/totals', {}, token)
  }

  async clearCart(token: string) {
    return this.fetchJSON('/carts/mine/clear', { method: 'POST' }, token)
  }
}

export default MagentoService
