import type { SfCart } from "./cart";

export interface SfGuestCart extends SfCart {
  guestId: string;
}
