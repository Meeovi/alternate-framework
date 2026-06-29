export interface SfShop {
  id: string;
  name: string;
  code: string;
  domain: string;
  currency: string;
  language: string;
  timezone: string;
  status: "active" | "inactive";
  productsCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
