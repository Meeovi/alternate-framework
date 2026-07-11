// layers/commerce/app/types/shipment.ts
import type { Address, ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type ShipmentStatus = 'pending' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'returned' | 'canceled'

export interface ShipmentItem extends Timestamps {
  id: ID
  shipmentId: ID
  productId: ID
  sku: string
  name: string
  qty: number
  weight?: number
}

export interface ShipmentTracking {
  id: ID
  shipmentId: ID
  carrier: string
  carrierCode?: string
  trackingNumber: string
  title?: string
  url?: string
  status?: string
  updatedAt?: string | Date
}

export interface ShipmentComment {
  id: ID
  shipmentId: ID
  comment: string
  isCustomerNotified?: boolean
  createdAt?: string | Date
}

export interface Shipment extends Timestamps {
  id: ID
  incrementId?: string
  orderId?: ID
  status: ShipmentStatus
  storeId?: ID
  customerId?: Maybe<ID>
  items: ShipmentItem[]
  tracking: ShipmentTracking[]
  comments?: ShipmentComment[]
  shippingAddress?: Address
  shippingMethod?: string
  shippingDescription?: string
  carrier?: string
  weight?: number
  packages?: Array<{
    weight: number
    length?: number
    width?: number
    height?: number
    contents: ID[] // shipmentItem ids
  }>
  shippedAt?: Maybe<string | Date>
  estimatedDelivery?: Maybe<string | Date>
}

export interface ShipmentSearchParams extends PaginationParams {
  orderId?: ID
  customerId?: ID
  status?: ShipmentStatus
}

export interface CreateShipmentInput {
  orderId: ID
  items: Array<{ orderItemId: ID; qty: number }>
  tracking?: Array<{ carrier: string; trackingNumber: string; title?: string }>
  comment?: string
}

export interface ShipmentProvider {
  getShipments(params?: ShipmentSearchParams): Promise<Paginated<Shipment>>
  getShipmentById(id: ID): Promise<Maybe<Shipment>>
  createShipment(input: CreateShipmentInput): Promise<Shipment>
  addTracking(shipmentId: ID, tracking: { carrier: string; trackingNumber: string; title?: string }): Promise<ShipmentTracking>
}
