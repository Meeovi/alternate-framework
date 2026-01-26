import { CommerceNormalizer } from "../normalizer";

export const shopifyNormalizer: CommerceNormalizer = {
  normalizeProduct(data: any) {
    // Shopify payloads vary depending on SDK; this maps common fields
    return {
      id: data?.id ?? data?.variants?.[0]?.id,
      title: data?.title ?? data?.name,
      price: data?.variants?.[0]?.price ?? data?.price,
      description: data?.body_html ?? data?.description,
      images: (data?.images ?? []).map((i: any) => i?.src || i?.url),
      raw: data,
    };
  },

  normalizeCategory(data: any) {
    return {
      id: data?.id,
      name: data?.title ?? data?.name,
      raw: data,
    };
  },

  normalizeCart(data: any) {
    return { raw: data };
  },
};

export default shopifyNormalizer;
