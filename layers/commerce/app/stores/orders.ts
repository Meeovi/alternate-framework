// stores/orders.ts - Pinia store for order management
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useOrders, useReturns, useTransactions, useInvoices, useCreditMemos } from '../composables/orders'
import type { Order as DomainOrder, PaymentIntent as DomainPaymentIntent } from '../types/domain'

type Order = DomainOrder
type Return = DomainOrder
type Transaction = DomainPaymentIntent
type Invoice = DomainOrder
type CreditMemo = DomainOrder
type OrderFilters = any

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const returns = ref<Return[]>([])
  const transactions = ref<Transaction[]>([])
  const invoices = ref<Invoice[]>([])
  const creditMemos = ref<CreditMemo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Import composables
  const { getOrders, getOrderById } = useOrders()
  const { getReturns, createReturn } = useReturns()
  const { getTransactions } = useTransactions()
  const { getInvoices } = useInvoices()
  const { getCreditMemos } = useCreditMemos()
  
  const fetchOrders = async (filters: OrderFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      orders.value = await getOrders(filters)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchOrder = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      currentOrder.value = await getOrderById(id)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching order:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchReturns = async (options: { search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      returns.value = await getReturns(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching returns:', err)
    } finally {
      loading.value = false
    }
  }
  
  const submitReturn = async (returnData: any) => {
    loading.value = true
    error.value = null
    try {
      const newReturn = await createReturn(returnData)
      returns.value.unshift(newReturn)
      return newReturn
    } catch (err: any) {
      error.value = err.message
      console.error('Error submitting return:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchTransactions = async (options: { search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      transactions.value = await getTransactions(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchInvoices = async (options: { search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      invoices.value = await getInvoices(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchCreditMemos = async (options: { search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      creditMemos.value = await getCreditMemos(options)
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching credit memos:', err)
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const ordersByStatus = computed(() => {
    return orders.value.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  const totalRevenue = computed(() => {
    const toNumber = (v: any) => (typeof v === 'number' ? v : (v?.value ?? 0))
    return orders.value
      .filter((order: Order) => !['cancelled', 'refunded'].includes(order?.status ?? ''))
      .reduce((sum: number, order: Order) => sum + toNumber(order?.total), 0)
  })

  const averageOrderValue = computed(() => {
    const validOrders = orders.value.filter((order: Order) => 
      !['cancelled', 'refunded'].includes(order.status)
    )
    return validOrders.length > 0 ? totalRevenue.value / validOrders.length : 0
  })
  
  return {
    // State
    orders: readonly(orders),
    currentOrder: readonly(currentOrder),
    returns: readonly(returns),
    transactions: readonly(transactions),
    invoices: readonly(invoices),
    creditMemos: readonly(creditMemos),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    ordersByStatus,
    totalRevenue,
    averageOrderValue,
    
    // Actions
    fetchOrders,
    fetchOrder,
    fetchReturns,
    submitReturn,
    fetchTransactions,
    fetchInvoices,
    fetchCreditMemos
  }
})