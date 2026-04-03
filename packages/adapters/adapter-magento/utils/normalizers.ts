import type { Cart, Category, Product } from "../types";

type MagentoProductNode = {
  sku?: string;
  name?: string;
  price_range?: {
    minimum_price?: {
      final_price?: {
        value?: number;
      };
    };
  };
  image?: {
    url?: string;
  };
};

type MagentoCategoryNode = {
  id?: string | number;
  name?: string;
};

type MagentoCartNode = {
  id?: string;
  items?: Array<{
    id?: string | number;
    quantity?: number;
    product?: {
      sku?: string;
    };
    prices?: {
      price?: {
        value?: number;
      };
    };
  }>;
};

export const normalizeProduct = (item: MagentoProductNode | null | undefined): Product => ({
  id: item?.sku ?? "",
  name: item?.name ?? "",
  price: item?.price_range?.minimum_price?.final_price?.value ?? 0,
  image: item?.image?.url ?? null
});

export const normalizeCategory = (item: MagentoCategoryNode | null | undefined): Category => ({
  id: item?.id != null ? String(item.id) : "",
  name: item?.name ?? ""
});

export const normalizeCart = (cart: MagentoCartNode | null | undefined): Cart => ({
  id: cart?.id ?? "",
  items: (cart?.items ?? []).map((item) => ({
    id: item.id != null ? String(item.id) : "",
    productId: item.product?.sku ?? "",
    quantity: item.quantity ?? 0,
    price: item.prices?.price?.value ?? 0
  }))
});