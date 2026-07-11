// layers/commerce/app/types/events.ts
import type { Address, ID, Maybe, Money, Paginated, PaginationParams, SeoMetadata, Timestamps } from './common'

export type EventStatus = 'draft' | 'active' | 'sold_out' | 'closed' | 'canceled'

export interface EventTicketType extends Timestamps {
  id: ID
  eventId: ID
  name: string
  price: Money
  qtyAvailable?: number
  qtySold?: number
  qtyPerCustomer?: number
  sortOrder?: number
  description?: string
}

export interface Event extends Timestamps {
  id: ID
  name: string
  slug: string
  description?: string
  status: EventStatus
  startAt: string | Date
  endAt?: Maybe<string | Date>
  timezone?: string
  venue?: Address
  isOnline?: boolean
  streamUrl?: string
  currencyCode: string
  ticketTypes: EventTicketType[]
  coverImage?: Maybe<string>
  seo?: SeoMetadata
  capacity?: number
}

export interface EventAttendee extends Timestamps {
  id: ID
  eventId: ID
  orderId?: ID
  customerId?: Maybe<ID>
  name: string
  email: string
  ticketTypeId: ID
  qrCode?: string
  checkedInAt?: Maybe<string | Date>
}

export interface EventSearchParams extends PaginationParams {
  status?: EventStatus
  from?: string
  to?: string
  search?: string
}

export interface EventProvider {
  getEvents(params?: EventSearchParams): Promise<Paginated<Event>>
  getEventById(id: ID): Promise<Maybe<Event>>
  getEventBySlug(slug: string): Promise<Maybe<Event>>
  getTicketTypes(eventId: ID): Promise<EventTicketType[]>
  registerAttendee(input: { eventId: ID; name: string; email: string; ticketTypeId: ID }): Promise<EventAttendee>
}
