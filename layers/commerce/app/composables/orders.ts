import { getCommerceClient } from '../utils/client'

function clientOrNull() {
  try {
    return getCommerceClient()
  } catch (e) {
    return null
  }
}

export function useOrders() {
  const client = clientOrNull()
  return {
    async getOrders(filters: any = {}) {
      if (client && typeof client.listOrders === 'function') return client.listOrders(filters)
      return []
    },
    async getOrderById(id: string) {
      if (client && typeof client.getOrder === 'function') return client.getOrder(id)
      return null
    }
  }
}

export function useReturns() {
  const client = clientOrNull()
  return {
    async getReturns(opts: any = {}) {
      if (client && typeof client.listReturns === 'function') return client.listReturns(opts)
      return []
    },
    async createReturn(data: any) {
      if (client && typeof client.createReturn === 'function') return client.createReturn(data)
      return null
    }
  }
}

export function useTransactions() {
  const client = clientOrNull()
  return {
    async getTransactions(opts: any = {}) {
      if (client && typeof client.listTransactions === 'function') return client.listTransactions(opts)
      return []
    }
  }
}

export function useInvoices() {
  const client = clientOrNull()
  return {
    async getInvoices(opts: any = {}) {
      if (client && typeof client.listInvoices === 'function') return client.listInvoices(opts)
      return []
    }
  }
}

export function useCreditMemos() {
  const client = clientOrNull()
  return {
    async getCreditMemos(opts: any = {}) {
      if (client && typeof client.listCreditMemos === 'function') return client.listCreditMemos(opts)
      return []
    }
  }
}

export default useOrders
