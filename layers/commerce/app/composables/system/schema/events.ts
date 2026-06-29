export interface SfEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields omitted
}

export interface SfEventTicket {
  id: string;
  eventId: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
  soldQty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
