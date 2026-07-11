// layers/commerce/app/types/stock.ts
import type { ID, Maybe, Paginated, PaginationParams, StockStatus, Timestamps } from './common'

export type StockMovementType =
  | 'sale'
  | 'refund'
  | 'restock'
  | 'adjustment'
  | 'reservation'
  | 'release'
  | 'transfer'
  | 'write_off'

export interface StockSource {
  id: ID
  code: string
  name: string
  description?: string
  isActive?: boolean
  latitude?: number
  longitude?: number
  address?: string
  priority?: number
}

export interface StockItem extends Timestamps {
  id: ID
  sku: string
  productId?: ID
  sourceCode?: string
  quantity: number
  salableQuantity: number
  status: StockStatus
  manageStock?: boolean
  backorders?: boolean
  minQty?: number
  notifyBelow?: number
  qtyIncrements?: number
  reservedQty?: number
}

export interface InventoryLot {
  id: ID
  sourceCode?: string
  sku: string
  qty: number
  batch?: string
  expiresAt?: Maybe<string | Date>
  createdAt?: string | Date
}

export interface StockMovement extends Timestamps {
  id: ID
  sku: string
  type: StockMovementType
  qty: number
  sourceCode?: string
  destinationCode?: string
  referenceId?: ID // order id, shipment id, etc.
  note?: string
  userId?: ID
}

export interface StockSearchParams extends PaginationParams {
  sku?: string
  sourceCode?: string
  status?: StockStatus
  lowStockOnly?: boolean
}

export interface StockProvider {
  getStockItems(params?: StockSearchParams): Promise<Paginated<StockItem>>
  getStockItemBySku(sku: string, sourceCode?: string): Promise<Maybe<StockItem>>
  getSources(): Promise<StockSource[]>
  adjustStock(sku: string, qty: number, type: StockMovementType, note?: string): Promise<StockItem>
  reserve(sku: string, qty: number, referenceId: ID): Promise<StockItem>
  release(sku: string, qty: number, referenceId: ID): Promise<StockItem>
}
