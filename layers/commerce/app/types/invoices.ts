// layers/commerce/app/types/invoices.ts
import type { Address, ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type InvoiceStatus = 'pending' | 'paid' | 'canceled' | 'refunded' | 'partially_paid'

export interface InvoiceItem extends Timestamps {
  id: ID
  invoiceId: ID
  productId: ID
  sku: string
  name: string
  qty: number
  price: Money
  discountAmount?: Money
  taxAmount?: Money
  rowTotal: Money
}

export interface InvoiceTotals {
  subtotal: Money
  discount: Money
  shipping: Money
  tax: Money
  grandTotal: Money
  paid: Money
  due: Money
}

export interface Invoice extends Timestamps {
  id: ID
  incrementId?: string
  orderId?: ID
  status: InvoiceStatus
  storeId?: ID
  customerId?: Maybe<ID>
  customerEmail?: string
  currencyCode: string
  items: InvoiceItem[]
  totals: InvoiceTotals
  billingAddress?: Address
  shippingAddress?: Address
  transactionId?: Maybe<string>
  dueDate?: string | Date
  notes?: string
}

export interface InvoiceSearchParams extends PaginationParams {
  orderId?: ID
  customerId?: ID
  status?: InvoiceStatus
}

export interface InvoiceProvider {
  getInvoices(params?: InvoiceSearchParams): Promise<Paginated<Invoice>>
  getInvoiceById(id: ID): Promise<Maybe<Invoice>>
  createInvoiceFromOrder(orderId: ID, items?: Array<{ orderItemId: ID; qty: number }>): Promise<Invoice>
  captureInvoice(invoiceId: ID, transactionId: string): Promise<Invoice>
}
