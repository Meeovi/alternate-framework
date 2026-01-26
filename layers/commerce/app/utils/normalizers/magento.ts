import { CommerceNormalizer } from "../normalizer";

export const magentoNormalizer: CommerceNormalizer = {
  normalizeProduct(data: any) {
    return {
      id: data?.id ?? data?.sku ?? data?.item_id,
      title: data?.name ?? data?.title,
      price:
        data?.price ?? data?.price_range?.minimum_price?.final_price?.value,
      description: data?.description ?? data?.short_description,
      images: (data?.media_gallery_entries ?? []).map((m: any) => m.file || m.url),
      raw: data,
    };
  },

  normalizeCategory(data: any) {
    return {
      id: data?.id,
      name: data?.name,
      raw: data,
    };
  },

  normalizeCart(data: any) {
    return { raw: data };
  },
};

export default magentoNormalizer;
