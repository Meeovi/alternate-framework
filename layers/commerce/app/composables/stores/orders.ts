// stores/orders.ts - Pinia store for order management
import type { Order, Return, Transaction, Invoice, CreditMemo, OrderFilters } from '~/app/types'

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
    return orders.value.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  const totalRevenue = computed(() => {
    return orders.value
      .filter(order => !['cancelled', 'refunded'].includes(order.status))
      .reduce((sum, order) => sum + order.total, 0)
  })

  const averageOrderValue = computed(() => {
    const validOrders = orders.value.filter(order => 
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