import type { CatalogItem } from '../../runtime/types'
import { SupplierError, type Credentials, type SupplierProvider, type SupplierVariant } from './types'
import { assertAllowedHost } from '../utils/context'

/**
 * CJdropshipping, API 2.0 — https://developers.cjdropshipping.cn/en/api/
 * The seller connects with their own CJ API key (My CJ → Authorization →
 * API). Access tokens last ~180 days; we re-issue from the API key when one
 * is within a week of expiry. Orders are created with payType 3 ("create
 * only"): nothing is paid automatically — the seller pays in My CJ.
 * Auth endpoints allow 1 call per second.
 */
const API = 'https://developers.cjdropshipping.com/api2.0/v1'
const PAGE_SIZE = 20
const RENEW_BEFORE_MS = 7 * 24 * 60 * 60 * 1000

interface CjResponse<T> { code: number, result: boolean, message: string, data: T }

async function call<T>(path: string, init: { method?: string, body?: unknown, token?: string } = {}): Promise<T> {
  assertAllowedHost(`${API}${path}`)
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      ...(init.token ? { 'CJ-Access-Token': init.token } : {}),
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    signal: AbortSignal.timeout(20_000),
  })
  const data = await response.json().catch(() => null) as CjResponse<T> | null
  if (!response.ok || !data?.result) {
    const auth = response.status === 401 || data?.code === 1600001 || /token|apikey|api key/i.test(data?.message ?? '')
    throw new SupplierError(`CJdropshipping: ${data?.message || `HTTP ${response.status}`}`, auth ? 400 : 502)
  }
  return data.data
}

async function issueToken(apiKey: string): Promise<Credentials> {
  const data = await call<{ accessToken: string, accessTokenExpiryDate: string, openId?: string }>(
    '/authentication/getAccessToken', { method: 'POST', body: { apiKey } })
  return { apiKey, accessToken: data.accessToken, expiresAt: Date.parse(data.accessTokenExpiryDate) || Date.now() + 150 * 86400_000 }
}

const token = (credentials: Credentials) => String(credentials.accessToken || '')
const num = (value: unknown) => {
  const n = Number.parseFloat(String(value ?? '').split('--')[0]!)
  return Number.isFinite(n) ? n : null
}
const ID = /^[A-Za-z0-9-]{1,64}$/

export const cj: SupplierProvider = {
  id: 'cj',
  label: 'CJdropshipping',

  async connect(input) {
    const apiKey = String(input.apiKey || '').trim()
    if (!/^[A-Za-z0-9@._-]{10,200}$/.test(apiKey)) throw new SupplierError('Paste your CJ API key', 400)
    const credentials = await issueToken(apiKey)
    return { credentials, label: 'CJdropshipping' }
  },

  async refresh(credentials) {
    if (Number(credentials.expiresAt || 0) - Date.now() > RENEW_BEFORE_MS) return null
    return issueToken(String(credentials.apiKey))
  },

  async listCatalog(credentials, { page, query }) {
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) })
    if (query) params.set('keyWord', query.slice(0, 100))
    const data = await call<{ totalPages: number, content: { productList: { id: string, nameEn: string, bigImage: string, sellPrice: string }[] }[] }>(
      `/product/listV2?${params}`, { token: token(credentials) })
    const list = (data.content ?? []).flatMap((c) => c.productList ?? [])
    const items: CatalogItem[] = list.map((p) => ({ id: p.id, name: p.nameEn, image: p.bigImage, price: num(p.sellPrice), variants: null }))
    return { items, hasMore: page < (data.totalPages ?? 0) }
  },

  async getProduct(credentials, productId) {
    if (!ID.test(productId)) throw new SupplierError('Invalid CJ product id', 400)
    const p = await call<{
      pid: string
      productNameEn: string
      description?: string
      productImageSet?: string[] | string
      bigImage?: string
      productWeight?: string | number
      variants: { vid: string, variantNameEn: string, variantSellPrice: number | string, variantWeight?: number, variantImage?: string }[]
    }>(`/product/query?pid=${encodeURIComponent(productId)}`, { token: token(credentials) })

    const stock = await cj.getStock(credentials, productId).catch(() => ({} as Record<string, number | null>))
    const imageSet = Array.isArray(p.productImageSet) ? p.productImageSet
      : typeof p.productImageSet === 'string' ? (() => { try { return JSON.parse(p.productImageSet as string) as string[] } catch { return [] } })() : []
    const variants: SupplierVariant[] = (p.variants ?? []).map((v) => ({
      id: v.vid,
      name: v.variantNameEn || p.productNameEn,
      cost: num(v.variantSellPrice),
      retailPrice: null,
      stock: stock[v.vid] ?? 0,
      weightKg: v.variantWeight ? Number(v.variantWeight) / 1000 : null, // CJ weights are grams
      image: v.variantImage ?? null,
    }))
    return {
      id: p.pid,
      name: p.productNameEn,
      description: p.description ?? '',
      images: [...new Set([p.bigImage, ...imageSet].filter((u): u is string => Boolean(u)))].slice(0, 8),
      variants,
    }
  },

  async getStock(credentials, productId) {
    if (!ID.test(productId)) throw new SupplierError('Invalid CJ product id', 400)
    const data = await call<{ variantInventories?: { vid: string, inventory: { totalInventory: number }[] }[] }>(
      `/product/stock/getInventoryByPid?pid=${encodeURIComponent(productId)}`, { token: token(credentials) })
    return Object.fromEntries((data.variantInventories ?? []).map((v) => [
      v.vid, (v.inventory ?? []).reduce((sum, i) => sum + (Number(i.totalInventory) || 0), 0),
    ]))
  },

  async createOrder(credentials, order) {
    const r = order.recipient
    const from = 'CN'
    const quotes = await call<{ logisticName: string, logisticPrice: number }[]>('/logistic/freightCalculate', {
      method: 'POST',
      token: token(credentials),
      body: { startCountryCode: from, endCountryCode: r.countryCode, products: order.items.map((i) => ({ vid: i.variantId, quantity: i.quantity })) },
    })
    const cheapest = [...(quotes ?? [])].sort((a, b) => a.logisticPrice - b.logisticPrice)[0]
    if (!cheapest) throw new SupplierError(`CJdropshipping: no shipping method to ${r.countryCode}`)

    const created = await call<{ orderId: string }>('/shopping/order/createOrderV2', {
      method: 'POST',
      token: token(credentials),
      body: {
        orderNumber: order.externalId,
        shippingCountryCode: r.countryCode,
        shippingCountry: r.countryCode,
        shippingProvince: r.region || r.regionCode || r.city,
        shippingCity: r.city,
        shippingAddress: r.address1,
        shippingAddress2: r.address2,
        shippingCustomerName: r.name,
        shippingZip: r.postcode,
        shippingPhone: r.phone,
        email: r.email,
        logisticName: cheapest.logisticName,
        fromCountryCode: from,
        payType: 3, // create only — the seller pays in My CJ
        products: order.items.map((i) => ({ vid: i.variantId, quantity: i.quantity })),
      },
    })
    return { supplierOrderId: created.orderId, status: 'awaiting_payment' }
  },

  async getShipments(credentials, supplierOrderId) {
    const order = await call<{ trackNumber?: string, trackingUrl?: string, logisticName?: string }>(
      `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(supplierOrderId)}`, { token: token(credentials) })
    return order.trackNumber
      ? [{ trackingNumber: order.trackNumber, trackingUrl: order.trackingUrl ?? null, carrier: order.logisticName || 'CJ Packet' }]
      : []
  },
}
