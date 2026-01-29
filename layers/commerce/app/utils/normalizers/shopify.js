export const shopifyNormalizer = {
    normalizeProduct(data) {
        // Shopify payloads vary depending on SDK; this maps common fields
        return {
            id: data?.id ?? data?.variants?.[0]?.id,
            title: data?.title ?? data?.name,
            price: data?.variants?.[0]?.price ?? data?.price,
            description: data?.body_html ?? data?.description,
            images: (data?.images ?? []).map((i) => i?.src || i?.url),
            raw: data,
        };
    },
    normalizeCategory(data) {
        return {
            id: data?.id,
            name: data?.title ?? data?.name,
            raw: data,
        };
    },
    normalizeCart(data) {
        return { raw: data };
    },
};
export default shopifyNormalizer;
