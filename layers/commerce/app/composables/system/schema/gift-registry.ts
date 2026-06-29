import type { SfProduct } from "./product";

export interface SfGiftRegistry {
  id: string;
  type: string;
  registryId: string;
  ownerId: string;
  registrant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: Record<string, any>;
  isPublic: boolean;
  eventName: string;
  eventDate: string;
  eventCountry: string;
  eventLocation: string;
  eventRegion: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    sku: string;
    name: string;
    price: number;
    qty: number;
    qtyAdded: number;
    position: number;
    description: string;
    isPurchased: boolean;
    sortOrder: number;
  }>;
  // Additional fields omitted
}
