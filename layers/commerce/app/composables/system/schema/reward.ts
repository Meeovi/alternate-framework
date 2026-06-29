export interface SfReward {
  id: string;
  customerId: string;
  points: number;
  balance: number;
  currency: string;
  expirationAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional relations omitted
}
