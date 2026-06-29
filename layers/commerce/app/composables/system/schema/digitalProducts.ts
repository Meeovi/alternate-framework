import type { SfProduct } from "./product";

export interface SfDigitalProduct {
  id: string;
  productId: string;
  sku: string;
  name: string;
  type: string;
  links: Array<{
    id: string;
    title: string;
    isShareable: boolean;
    numberOfDownloads: number;
    price: number;
    purchases: number;
    maxDownloads: number;
    type: "file" | "url";
    file: string;
    sampleFile: string;
    sampleType: "file" | "url";
    url: string;
    sortOrder: number;
    numberOfUsesBought: number;
    useDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}
